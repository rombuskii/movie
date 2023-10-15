import { useState, useEffect, useContext, createContext} from "react";
import axios from "axios";



const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext)
    
}



export const UserProvider = ({children}) => {
    const [user, setUser] = useState(undefined);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const logout = async() => {
        setUser(undefined);
        setIsAuthenticated(false)
        await axios.get('http://localhost:3001/api/logout', {withCredentials: true})
    }

    const getUser = async() => {
        await axios.get('http://localhost:3001/api/user', {withCredentials: true})
        .then(response => {
            setUser(response.data)
            setIsAuthenticated(true);
        }).catch(err => {
            setUser(undefined)});
    }

    useEffect(() => {
        getUser();
    }, [setUser])


    return (
        <UserContext.Provider value={{user, setUser, isAuthenticated, setIsAuthenticated, logout}}>
            {children}
        </UserContext.Provider>
    )
}