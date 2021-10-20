import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { code } = req.body;

      const authenticateUser = new AuthenticateUserService();

      const data = await authenticateUser.run(code);

      return res.json(data);
    } catch (err) {
      return res.json(err);
    }
  }
}

export { AuthenticateUserController };
