import React from 'react';
import { Sparkles, Code, Briefcase, Mic, Edit3 } from 'lucide-react';

export const PERSONAS = [
    {
        id: 'standard',
        name: 'Standard',
        icon: <Sparkles size={20} />,
        desc: 'Balanced & helpful',
        prompt: ''
    },
    {
        id: 'dev',
        name: 'Developer',
        icon: <Code size={20} />,
        desc: 'Code-focused & technical',
        prompt: '[SYSTEM: Act as a Senior Software Engineer. Provide efficient, well-commented code. Use Markdown for all code blocks.] '
    },
    {
        id: 'researcher',
        name: 'Researcher',
        icon: <Briefcase size={20} />,
        desc: 'Factual & cited',
        prompt: '[SYSTEM: Act as a Document Analyst. Analyze the context/files deeply and provide cited, factual answers. Use clear headings.] '
    },
    {
        id: 'designer',
        name: 'Designer',
        icon: <Edit3 size={20} />,
        desc: 'Visual & creative',
        prompt: '[SYSTEM: Act as a Creative Director. Focus on visual descriptions, design principles, and UI/UX best practices. When asked for images, generate detailed prompts.] '
    },
    {
        id: 'witty',
        name: 'Witty',
        icon: <Mic size={20} />,
        desc: 'Fun & Sarcastic',
        prompt: '[SYSTEM: Be witty, sarcastic, and entertaining, but still helpful. Use emojis occasionally.] '
    }
];
