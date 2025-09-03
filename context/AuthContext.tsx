import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "my-jwt";

interface UserPayload {
  id: string;
  email: string;
}

const AuthContext = createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  token: string | null;
  user: UserPayload | null;
  isLoading: boolean;
}>({
  signIn: () => {},
  signOut: () => {},
  token: null,
  user: null, 
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    async function loadAuthData() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          try {
            const decodedUser = jwtDecode<UserPayload>(storedToken);
            setToken(storedToken);
            setUser(decodedUser);
          } catch (decodeError) {
            console.error("Failed to decode token from storage", decodeError);
            await SecureStore.deleteItemAsync(TOKEN_KEY); 
          }
        }
      } catch (e) {
        console.error("Failed to load token from storage", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthData();
  }, []);

  const signIn = async (newToken: string) => {
    try {
      const decodedUser = jwtDecode<UserPayload>(newToken);
      setToken(newToken);
      setUser(decodedUser);
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } catch (error) {
      console.error("Failed to decode new token on sign-in:", error);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null); 
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const value = {
    signIn,
    signOut,
    token,
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
