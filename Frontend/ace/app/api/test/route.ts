import dbConnect  from '@/db/config';
import { NextResponse, NextRequest } from 'next/server';


export async function GET(request: NextRequest){
    try {
        await dbConnect();
       return NextResponse.json({
        success: true, message: "successfully fetched."
       }, {status: 200}) 
    } catch (error) {
       console.error(error)
       return NextResponse.json(
         {success: false, message: "faild to check health."},
         {status: 500}
        )
    }
}