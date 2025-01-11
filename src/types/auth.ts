
import { User } from "./user";

export interface AuthState {
  token: string | null;
  message: string | null;
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

export interface CredentialsPayload {
  token?: string;
  message?: string;
  user: User | null;
}

// Response returned after user authentication or registration
export type UserResponse = {
  message?: string;
  success?: boolean;
  user: User;
  token?: string;
};
export type DataResponse = {
  message?: string;
  success?: boolean;
 
};
export type ProductResponse = {
  message?: string;
  success?: boolean;
product:Product
};
export type AllUserResponse = {
  message?: string;
  success?: boolean;
  user: Array<User>;
};

// Credentials used for login
export type LoginCredentials = {
  email: string; // Email entered by the user
  password: string; // Password entered by the user
};

// Credentials used for registration
export type RegisterCredentials = {
  username: string; // User's full name
  email: string; // Email entered during signup
  password: string; // Password entered during signup
};

export type forgetPasswordCredentails = {
email:string
};
export type verifyforgetPasswordlOTP = {
  email:string
  otp:string
  password?:string
  };
  
export type updateUser = {
  username: string; // User's full name
  phone: string;
  address: string;
};

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
    specifications?: Record<string, string>;
    brand: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  type Details = {
    message: string;
  };
  export interface CustomError {
    status: number | string;
  
    data: {
      error?: string;
      message: string;
      details: Array<Details>;
      success: boolean;
    };
  }
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
    specifications?: Record<string, string>;
    brand: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }

  export interface CustomError {
    status: number | string;
  
    data: {
      error?: string;
      message: string;
      details: Array<Details>;
      success: boolean;
    };
  }