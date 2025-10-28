import { Request, Response, Router } from "express";

const router = Router();

/**
 * POST /api/telegram/webhook
 * Безопасный webhook для Telegram Bot
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const expectedSecret = process.env.TELEGRAM_BOT_SECRET;
    const providedSecret = req.get("X-Telegram-Bot-Api-Secret-Token");

    if (expectedSecret) {
      if (!providedSecret || providedSecret !== expectedSecret) {
        return res.status(401).json({ success: false });
      }
    }

    // Быстрый 200 для Telegram
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: true });
  }
});

export default router;
