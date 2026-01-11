import { apiSpring } from "./api";
import type { LoginRequest, LoginResponse } from "../types/auth";
import axios from "axios";

export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiSpring.post<LoginResponse>('/auth/login', body);

    console.log("check reponse from call api /auth/login: ", response);
    console.log(
      "check reponse.data from call api /auth/login: ",
      response.data
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error message: ", error.message);
      throw new Error(`Axios error: ${error.message}`);
    }

    throw error;
  }
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    if (refreshToken) {
      await apiSpring.post('/v1/auth/logout', null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
    }
  } catch (error) {
    console.log("Lỗi gọi api logout", error);
  }
  finally{
    localStorage.clear();
  }
}
