// const express = require('express');
// const {
//     addNote,
//     editNote,
//     getAllNotes,
//     deleteNoteById,
//     updateNotePinned,
//     searchNotes
// } = require('../controllers/noteController');
// const { authenticate } = require('../middleware/auth');
// const router = express.Router();
// const axios = require('axios');

// router.post('/notes', authenticate, addNote);
// router.get('/notes', getAllNotes);
// router.put('/notes/:noteId', editNote);
// router.delete('/notes/:noteId', deleteNoteById);
// router.patch('/notes/:noteId/pin', updateNotePinned);
// router.get('/notes/search', searchNotes);



// router.post('/', async (req, res) => {
//     const { message } = req.body;

//     try {
//         const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
//             model: 'mistralai/mistral-7b-instruct',
//             messages: [{ role: 'user', content: message }]
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                 'HTTP-Referer': 'http://localhost:5173/', // Required
//                 'Content-Type': 'application/json'
//             }
//         });

//         console.log('OpenRouter response:', response.data); // 🧪 Check this

//         const botMessage = response.data?.choices?.[0]?.message?.content;

//         if (!botMessage) {
//             return res.status(500).json({ error: 'Bot response empty or malformed', raw: response.data });
//         }

//         res.json({ message: botMessage });

//     } catch (error) {
//         console.error('OpenRouter Error:', error.response?.data || error.message);
//         res.status(500).json({ error: 'Failed to get response from AI' });
//     }
// });



// module.exports = router;




// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
// const MODEL = 'mistralai/mistral-7b-instruct';

// function extractProjectId(message) {
//     const match = message.match(/[0-9a-fA-F]{24}/);
//     return match ? match[0] : null;
// }

// function extractProjectName(message) {
//     const match = message.match(/project\s+([a-zA-Z0-9\s\-]+)/i);
//     return match ? match[1].trim() : null;
// }

// async function sendToAI(prompt) {
//     const aiRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
//         model: MODEL,
//         messages: [
//             { role: 'system', content: 'You are a helpful assistant that analyzes BOQ and contractor data.' },
//             { role: 'user', content: prompt }
//         ]
//     }, {
//         headers: {
//             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             'HTTP-Referer': 'http://localhost:3000',
//             'Content-Type': 'application/json'
//         }
//     });

//     return aiRes.data.choices[0].message.content;
// }


// router.post('/', async (req, res) => {
//     const { message } = req.body;

//     try {
//         // === Detect command intent ===
//         const lowerMsg = message.toLowerCase();

//         if (lowerMsg.includes('boq') && lowerMsg.includes('project')) {
//             // Get BOQ by project
//             const projectName = extractProjectName(message);
//             if (!projectName) return res.json({ message: 'Please provide a valid project name' });

//             const boqRes = await axios.get(`https://operations-nadh.onrender.com/api/bills/sheets`);
//             const matched = boqRes.data.find(sheet => sheet.projectName.toLowerCase() === projectName.toLowerCase());

//             if (!matched) return res.json({ message: `No BOQ sheet found for ${projectName}` });

//             const boqContext = matched.boqData
//                 .map(sheet => `Sheet: ${sheet.sheetName}\nRows: ${sheet.data.length}`)
//                 .join('\n\n');

//             const prompt = `Here is the BOQ sheet for project "${projectName}":\n\n${boqContext}\n\nAnswer the user's request: "${message}"`;

//             const aiRes = await sendToAI(prompt);
//             return res.json({ message: aiRes });

//         } else if (lowerMsg.includes('contractors') && lowerMsg.includes('project')) {
//             // Get contractors by projectId (assumes user includes projectId in message)
//             const projectId = extractProjectId(message);
//             if (!projectId) return res.json({ message: 'Please provide a valid project ID' });

//             const contractorRes = await axios.get(`https://operations-nadh.onrender.com/contractors/list/${projectId}`);
//             const contractors = contractorRes.data.contractors;

//             const summary = contractors.map(c =>
//                 `Contractor: ${c.contractorName}, Contact: ${c.contactNumber}, WorkItems: ${c.workItems.length}`
//             ).join('\n');

//             const prompt = `Here are the contractors for project ID "${projectId}":\n\n${summary}\n\nRespond to the user's request: "${message}"`;

//             const aiRes = await sendToAI(prompt);
//             return res.json({ message: aiRes });

//         } else if (lowerMsg.includes('compare') && lowerMsg.includes('boq') && lowerMsg.includes('contractor')) {
//             // Mini comparison
//             const projectName = extractProjectName(message);
//             const projectId = extractProjectId(message);

//             if (!projectName || !projectId) return res.json({ message: 'Please include both project name and ID to compare.' });

//             // Fetch BOQ
//             const boqRes = await axios.get(`https://operations-nadh.onrender.com/api/bills/sheets`);
//             const boqMatch = boqRes.data.find(sheet => sheet.projectName.toLowerCase() === projectName.toLowerCase());
//             if (!boqMatch) return res.json({ message: 'No matching BOQ found' });

//             // Fetch Contractors
//             const contractorRes = await axios.get(`https://operations-nadh.onrender.com/contractors/list/${projectId}`);
//             const contractors = contractorRes.data.contractors;

//             const context = `
// Project Name: ${projectName}
// Project ID: ${projectId}

// === BOQ Sheets ===
// ${boqMatch.boqData.map(s => `${s.sheetName} - ${s.data.length} rows`).join('\n')}

// === Contractors ===
// ${contractors.map(c => `${c.contractorName} (${c.contactNumber}) - ${c.workItems.length} work items`).join('\n')}
//             `;

//             const prompt = `Compare contractor work with the BOQ sheet for project "${projectName}". Show any mismatches or overlaps.\n\n${context}`;

//             const aiRes = await sendToAI(prompt);
//             return res.json({ message: aiRes });
//         }

//         // Fallback: general chat
//         const aiRes = await sendToAI(message);
//         return res.json({ message: aiRes });

//     } catch (err) {
//         console.error('Chatbot error:', err);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Static data (Replace with actual JSON content)
const COMPANY_DATA = require('../companyData.json'); // Alternatively, paste the JSON inline if you prefer

const MODEL = 'mistralai/mistral-7b-instruct';

// AI Request Helper
async function sendToAI(prompt) {
    const aiRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: MODEL,
        messages: [
            { role: 'system', content: 'You are a helpful assistant that answers questions based on company profile and product catalog data.' },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
    });

    return aiRes.data.choices[0].message.content;
}

router.post('/', async (req, res) => {
    const { message } = req.body;

    try {
        const prompt = `
Here is the full company profile and product/service data in JSON format:
\`\`\`json
${JSON.stringify(COMPANY_DATA, null, 2)}
\`\`\`

Now respond to the user's message:
"${message}"
        `;

        const aiRes = await sendToAI(prompt);
        return res.json({ message: aiRes });

    } catch (err) {
        console.error('Chatbot error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
