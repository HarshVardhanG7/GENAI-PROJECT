const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `You are an expert interview preparation AI. Generate a comprehensive interview report for a candidate.

CANDIDATE INFORMATION:
Resume: ${resume || 'Not provided'}
Self Description: ${selfDescription || 'Not provided'}

JOB DESCRIPTION:
${jobDescription}

Generate ONLY valid JSON with EXACTLY these fields:
{
  "title": "The exact job title from the job description",
  "matchScore": 75,
  "technicalQuestions": [
    {"question": "Question text", "intention": "Why", "answer": "How to answer"}
  ],
  "behavioralQuestions": [
    {"question": "Question text", "intention": "Why", "answer": "How to answer"}
  ],
  "skillGaps": [
    {"skill": "Skill name", "severity": "low"}
  ],
  "preparationPlan": [
    {"day": 1, "focus": "Focus area", "tasks": ["Task 1"]}
  ]
}

REQUIREMENTS:
- Generate 5-7 technical questions
- Generate 5-7 behavioral questions
- Include 3-5 skill gaps
- Create 7-day preparation plan
- matchScore must be a number 0-100
- severity must be "low", "medium", or "high"
- Return ONLY valid JSON, no other text`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    })

    try {
        const responseText = response.text
        console.log("Raw AI response length:", responseText.length)
        
        // Try to extract JSON from response
        let jsonData = null
        
        // Try 1: Direct parse
        try {
            jsonData = JSON.parse(responseText)
            console.log("Successfully parsed as direct JSON")
        } catch (e1) {
            console.log("Direct parse failed, trying to extract JSON...")
            
            // Try 2: Extract JSON block from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/m)
            if (jsonMatch) {
                try {
                    jsonData = JSON.parse(jsonMatch[0])
                    console.log("Successfully extracted and parsed JSON block")
                } catch (e2) {
                    console.log("Extracted JSON parse failed")
                }
            }
        }
        
        // If JSON parsing failed, generate from raw text
        if (!jsonData || typeof jsonData !== 'object') {
            console.log("Could not parse JSON, generating from raw response")
            jsonData = parseRawResponse(responseText)
        }
        
        // Validate and ensure all required fields exist
        const validated = validateAndFixResponse(jsonData)
        console.log("Validated response:", JSON.stringify(validated, null, 2))
        
        return validated
    } catch (error) {
        console.error("Error in generateInterviewReport:", error.message)
        // Return default response instead of throwing
        return generateDefaultResponse()
    }
}

function parseRawResponse(text) {
    // Fallback parser for unstructured text responses
    console.log("Parsing raw text response...")
    
    return {
        title: extractTitle(text),
        matchScore: extractMatchScore(text),
        technicalQuestions: extractQuestions(text, 'technical'),
        behavioralQuestions: extractQuestions(text, 'behavioral'),
        skillGaps: extractSkillGaps(text),
        preparationPlan: extractPreparationPlan(text)
    }
}

function extractTitle(text) {
    const titleMatch = text.match(/(?:title|position|role)[\s:"]*([^\n,\.]+)/i)
    return titleMatch ? titleMatch[1].trim() : "Position"
}

function extractMatchScore(text) {
    const scoreMatch = text.match(/(?:match\s*score|score)[\s:"]*(\d+)/i)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 65
    return Math.min(100, Math.max(0, score))
}

function extractQuestions(text, type) {
    const questions = []
    const pattern = type === 'technical' 
        ? /technical\s*question[\s\S]*?(?:\d+[\.\)])\s*([^\n]+)/gi
        : /behavioral\s*question[\s\S]*?(?:\d+[\.\)])\s*([^\n]+)/gi
    
    let match
    let questionCount = 0
    while ((match = pattern.exec(text)) && questionCount < 7) {
        questions.push({
            question: match[1].trim(),
            intention: "This question tests key competencies",
            answer: "Provide a detailed answer with examples and explanations"
        })
        questionCount++
    }
    
    return questions.length > 0 ? questions : generateDefaultQuestions()
}

function extractSkillGaps(text) {
    const gaps = []
    const skillMatch = text.match(/skill\s*gap[\s\S]*?:([\s\S]*?)(?:preparation|$)/i)
    if (skillMatch) {
        const skillText = skillMatch[1]
        const skills = skillText.match(/([A-Za-z\s&]+)[\s]*(?:high|medium|low)/gi)
        if (skills) {
            skills.forEach(skill => {
                const sevMatch = skill.match(/(high|medium|low)/i)
                gaps.push({
                    skill: skill.replace(/(high|medium|low)/i, '').trim(),
                    severity: sevMatch ? sevMatch[1].toLowerCase() : 'medium'
                })
            })
        }
    }
    
    return gaps.length > 0 ? gaps : generateDefaultSkillGaps()
}

function extractPreparationPlan(text) {
    const plan = []
    const dayMatches = text.match(/day\s+(\d+)[:\s]*([\s\S]*?)(?=day\s+\d+|$)/gi)
    
    if (dayMatches) {
        dayMatches.forEach((dayBlock, index) => {
            plan.push({
                day: index + 1,
                focus: dayBlock.substring(0, 100),
                tasks: [
                    "Study core concepts",
                    "Practice problems",
                    "Review and consolidate learning"
                ]
            })
        })
    }
    
    return plan.length > 0 ? plan : generateDefaultPlan()
}

function convertFlatArrayToObject(arr) {
    // This function is no longer used but kept for compatibility
    return {}
}

function parseQuestionsFromString(text) {
    // This function is no longer used but kept for compatibility
    return generateDefaultQuestions()
}

function parseSkillGapsFromArray(arr) {
    // This function is no longer used but kept for compatibility
    return generateDefaultSkillGaps()
}

function parsePreparationPlanFromArray(arr) {
    // This function is no longer used but kept for compatibility
    return generateDefaultPlan()
}

function validateAndFixResponse(data) {
    return {
        title: data.title || "Position",
        matchScore: Math.min(100, Math.max(0, Number(data.matchScore) || 50)),
        technicalQuestions: Array.isArray(data.technicalQuestions) && data.technicalQuestions.length > 0 
            ? data.technicalQuestions 
            : generateDefaultQuestions(),
        behavioralQuestions: Array.isArray(data.behavioralQuestions) && data.behavioralQuestions.length > 0 
            ? data.behavioralQuestions 
            : generateDefaultQuestions(),
        skillGaps: Array.isArray(data.skillGaps) && data.skillGaps.length > 0 
            ? data.skillGaps 
            : generateDefaultSkillGaps(),
        preparationPlan: Array.isArray(data.preparationPlan) && data.preparationPlan.length > 0 
            ? data.preparationPlan 
            : generateDefaultPlan()
    }
}

function generateDefaultQuestions() {
    return [
        {
            question: "Tell us about your most significant project",
            intention: "To understand your technical capabilities and problem-solving approach",
            answer: "Describe a complex project you've built, the challenges faced, and solutions implemented"
        },
        {
            question: "How do you stay updated with new technologies?",
            intention: "To assess your commitment to continuous learning",
            answer: "Explain your approach to learning new tools and technologies"
        }
    ]
}

function generateDefaultSkillGaps() {
    return [
        { skill: "Advanced System Design", severity: "medium" },
        { skill: "Production Deployment", severity: "medium" },
        { skill: "Cloud Infrastructure", severity: "low" },
        { skill: "Performance Optimization", severity: "medium" },
        { skill: "Containerization & DevOps", severity: "low" }
    ]
}

function generateDefaultPlan() {
    return [
        { day: 1, focus: "Review Core Concepts", tasks: ["Study fundamentals", "Review past projects"] },
        { day: 2, focus: "Deep Dive into Tech Stack", tasks: ["Master key technologies", "Build practice project"] },
        { day: 3, focus: "System Design", tasks: ["Learn design patterns", "Practice design questions"] },
        { day: 4, focus: "Advanced Topics", tasks: ["Study advanced concepts", "Solve complex problems"] },
        { day: 5, focus: "Performance Optimization", tasks: ["Learn optimization techniques", "Review scalability"] },
        { day: 6, focus: "DevOps & Deployment", tasks: ["Study deployment strategies", "Learn CI/CD"] },
        { day: 7, focus: "Final Review & Mock Interview", tasks: ["Full mock interview", "Review all topics"] }
    ]
}

function generateDefaultResponse() {
    return {
        title: "Software Developer Position",
        matchScore: 65,
        technicalQuestions: generateDefaultQuestions(),
        behavioralQuestions: generateDefaultQuestions(),
        skillGaps: generateDefaultSkillGaps(),
        preparationPlan: generateDefaultPlan()
    }
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }