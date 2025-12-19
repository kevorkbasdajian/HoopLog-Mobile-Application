import * as quotesService from "../services/quotesService.js";

//GET Receive a random quote
export async function getRandomQuote(req, res, next) {
  try {
    const quote = await quotesService.getRandomQuote();
    if (!quote) return res.status(404).json({ message: "No quotes available" });

    res.status(200).json(quote);
  } catch (err) {
    next(err);
  }
}
