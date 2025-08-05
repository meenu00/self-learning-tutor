
import { GoogleGenAI, Type } from "@google/genai";
import type { Course, Topic, QuizQuestion, Task, TaskEvaluation, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

const courseSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['lesson', 'checkpoint'] },
        },
        required: ['title', 'type'],
      },
    },
    icon: {type: Type.STRING, description: "A single emoji representing the subject, e.g., '💻' for web development."}
  },
  required: ['subject', 'topics', 'icon'],
};

const contentSchema = {
    type: Type.OBJECT,
    properties: {
        content: { type: Type.STRING, description: "Detailed, well-formatted learning content for the topic in Markdown format. Use headings, lists, and bold text to structure the information."},
        references: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of up to 3 relevant, high-quality URLs for further reading, like MDN for web topics." }
    },
    required: ['content', 'references']
};

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right."}
        },
        required: ['question', 'options', 'correctAnswer', 'explanation']
    }
};

const taskSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A small, practical task description for the student."},
        evaluationCriteria: { type: Type.STRING, description: "Clear criteria on how the submission will be evaluated."}
    },
    required: ['description', 'evaluationCriteria']
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        passed: { type: Type.BOOLEAN },
        feedback: { type: Type.STRING, description: "Constructive feedback for the student's submission." },
        score: { type: Type.INTEGER, description: "A score from 0 to 100 based on the evaluation." }
    },
    required: ['passed', 'feedback', 'score']
};


export const generateCourseOutline = async (subject: string, userTopics?: string): Promise<Omit<Course, 'id' | 'createdAt'>> => {
    const prompt = `Create a structured learning path for the subject: "${subject}". 
    The path should follow Bloom's Taxonomy, starting from remembering/understanding and moving to applying/analyzing.
    Include a mix of lessons and practical checkpoints. A checkpoint should come after a few related lessons.
    ${userTopics ? `The user has provided the following syllabus to consider: ${userTopics}. Please integrate these topics logically.` : ''}
    Generate a JSON object representing the course outline. The course must have a subject, an emoji icon, and a list of topics. Each topic must have a title and a type ('lesson' or 'checkpoint').
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: courseSchema,
        },
    });

    try {
        const json = JSON.parse(response.text);
        return json;
    } catch(e) {
        console.error("Failed to parse course outline JSON:", response.text, e);
        throw new Error("Failed to generate a valid course outline.");
    }
};


export const generateTopicContent = async (topicTitle: string, subject: string): Promise<{content: string; references: string[]}> => {
    const prompt = `Generate educational content for the topic "${topicTitle}" within the subject of "${subject}".
    Act as an expert educator. The content must be accurate, clear, and engaging.
    Provide the content in Markdown format.
    Include up to 3 high-quality, relevant URL references for further study (e.g., MDN for web dev, official docs, reputable educational sites).
    Do not hallucinate or provide false information.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: contentSchema
        },
    });
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse topic content:", response.text, e);
        throw new Error("Failed to generate valid topic content.");
    }
};


export const generateQuiz = async (topicContent: string, topicTitle: string): Promise<QuizQuestion[]> => {
    const prompt = `Based on the following content for the topic "${topicTitle}", generate a 3-question multiple-choice quiz.
    The questions should test the user's understanding of the key concepts.
    Each question must have 4 options and a single correct answer.
    Provide a brief explanation for the correct answer.

    Content:
    ---
    ${topicContent}
    ---
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema
        },
    });
    try {
        const parsed = JSON.parse(response.text);
        // Ensure options are shuffled for better UX
        return parsed.map((q: QuizQuestion) => ({
            ...q,
            options: q.options.sort(() => Math.random() - 0.5)
        }));
    } catch (e) {
        console.error("Failed to parse quiz JSON:", response.text, e);
        throw new Error("Failed to generate a valid quiz.");
    }
};


export const generateTask = async (topicTitle: string, subject: string): Promise<Task> => {
    const prompt = `Create a small, practical checkpoint task for a student who has just completed the topic "${topicTitle}" in the subject "${subject}".
    The task should allow the student to apply what they've learned.
    Provide a clear task description and the criteria for evaluation.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: taskSchema
        },
    });
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse task JSON:", response.text, e);
        throw new Error("Failed to generate a valid task.");
    }
};


export const evaluateTask = async (taskDescription: string, userSubmission: string, topicTitle: string): Promise<TaskEvaluation> => {
    const prompt = `As an expert evaluator, assess the following student submission for the topic "${topicTitle}".

    Task Description:
    ${taskDescription}

    Student Submission:
    \`\`\`
    ${userSubmission}
    \`\`\`

    Evaluate the submission based on correctness, effort, and alignment with the topic.
    Determine if the submission passes (score >= 70).
    Provide concise, constructive feedback and a score from 0-100.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evaluationSchema
        },
    });
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse evaluation JSON:", response.text, e);
        throw new Error("Failed to generate a valid evaluation.");
    }
};

export const getChatResponse = async (topicContent: string, chatHistory: ChatMessage[], newUserMessage: string): Promise<string> => {
    const systemInstruction = `You are a helpful and encouraging AI Tutor. Your knowledge is strictly limited to the following topic content. Do not answer questions outside of this context. If a question is outside the scope, politely decline to answer. Keep your answers concise and clear.

    TOPIC CONTEXT:
    ---
    ${topicContent}
    ---
    `;
    
    const contents = [
        ...chatHistory.map(msg => ({
            role: msg.role,
            parts: [{text: msg.content}]
        })),
        { role: 'user', parts: [{text: newUserMessage}] }
    ];

    const response = await ai.models.generateContent({
        model,
        contents: contents,
        config: {
            systemInstruction
        }
    });

    return response.text;
};