import { useUser} from "@/context/UserContext";
 import { useEffect } from "react";
 import { redirect } from "next/navigation";
export default function isAuth(Component) {
    return function IsAuth(props) {
      const user = useUser();
  
  
      useEffect(() => {
        if (!user) {
          return redirect("/login");
        }
      }, []);
  
  
      if (!user) {
        return null;
      }
  
      return <Component {...props} />;
    };
  }
  