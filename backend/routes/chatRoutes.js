import express from 'express';
import {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  renameChat,
  sendMessage,
  sendImageMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);
router.put('/:id', renameChat);
router.post('/:id/message', sendMessage);
router.post('/:id/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, sendImageMessage);

export default router;
