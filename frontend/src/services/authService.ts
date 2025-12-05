import axios from "axios";
import type { LoginRequest, LoginResponse } from "../types/auth";

const API_PORT_SPRING = "8080";
const API_PORT_SPRING_v2 = import.meta.env.VITE_API_PORT_SPRING;
const url = `http://localhost:${API_PORT_SPRING_v2}/api/v1/auth/login`;
// const url = `http://localhost:${API_PORT_SPRING}/api/v1/auth/login`;
// syntax axios for call apI: axios.post<Response Type>(url, body)

export async function login(body: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(url, body);

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
  const url = `http://localhost:${API_PORT_SPRING_v2}/api/v1/auth/logout`;

  try {
    if (refreshToken) {
      await axios.post(url, null, {
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
    window.location.reload();
  }
}
