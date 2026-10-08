import { useAuth } from "@/lib/auth-context";
import { logoutRequest } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import {useNavigate} from '@tanstack/react-router';
import {toast} from 'sonner';
import { getErrorMessage } from "@/lib/get-error-message";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function Logout(){
    const navigate = useNavigate();
    const {clearUser}  = useAuth();
     const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: (res) => {
      toast.success(res.message)
      clearUser()
      navigate({ to: '/auth/signin' })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    })
    return (
        <Button
            className='cursor-pointer'
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
        >
            <LogOut size={22} color={logoutMutation.isPending ? 'red' : 'white'}/>
         </Button>
    )
    
}