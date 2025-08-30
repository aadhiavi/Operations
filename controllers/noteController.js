const Note = require("../models/Note");

// ✅ Add Note
const addNote = async (req, res) => {
    const userId = req.user.userId;
    const { title, content, tags } = req.body;

    if (!title?.trim()) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }

    if (!content?.trim()) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title: title.trim(),
            content: content.trim(),
            tags: tags || [],
            userId
        });

        await note.save();
        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Edit Note
const editNote = async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { userId } = req.params;

    if (!title && !content && !tags && isPinned === undefined) {
        return res.status(400).json({ error: true, message: "No changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title !== undefined) note.title = title.trim();
        if (content !== undefined) note.content = content.trim();
        if (tags !== undefined) note.tags = tags;
        if (isPinned !== undefined) note.isPinned = isPinned; // ✅ FIXED (was skipping false)

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Get All Notes
const getAllNotes = async (req, res) => {
    const { userId } = req.params;

    try {
        const notes = await Note.find({ userId }).sort({ isPinned: -1 });

        return res.json({
            error: false,
            notes,
            message: "All notes retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Delete Note
const deleteNoteById = async (req, res) => {
    const { noteId, userId } = req.params;

    try {
        const note = await Note.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" }); // ✅ FIXED `.return()` -> `.status()`
        }

        await Note.deleteOne({ _id: noteId, userId });

        return res.json({ error: false, message: "Note deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Update isPinned
const updateNotePinned = async (req, res) => {
    const { noteId, userId } = req.params;
    const { isPinned } = req.body;

    if (typeof isPinned !== "boolean") {
        return res.status(400).json({ error: true, message: "isPinned must be boolean" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned;
        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Search Notes
const searchNotes = async (req, res) => {
    const { userId } = req.params;
    const { query } = req.query;

    if (!query?.trim()) {
        return res.status(400).json({ error: true, message: "Search query is required" });
    }

    try {
        const matchingNotes = await Note.find({
            userId,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });

        return res.json({
            error: false, // ✅ FIXED typo
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// ✅ Export functions (no duplicates)
module.exports = {
    addNote,
    editNote,
    getAllNotes,
    deleteNoteById,
    updateNotePinned,
    searchNotes,
};
