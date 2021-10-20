import axios from "axios";
import { sign } from "jsonwebtoken";
import { prismaClient } from "../prisma";

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

const accessTokenUrl = "https://github.com/login/oauth/access_token";
const userDetailsUrl = "https://api.github.com/user";

class AuthenticateUserService {
  async run(code: string) {
    const {
      data: { access_token },
    } = await axios.post<IAccessTokenResponse>(accessTokenUrl, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET_KEY,
        code,
      },
      headers: {
        Accept: "application/json",
      },
    });

    const { data: githubUser } = await axios.get<IUserResponse>(
      userDetailsUrl,
      {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }
    );

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: githubUser.id,
      },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: {
          github_id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
        },
      });
    }

    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.JWT_SECRET_KEY,
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
