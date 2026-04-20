import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellDotIcon, HandHelpingIcon, Clock2Icon, CalendarIcon, BadgeCheck, ArrowBigLeftDash, ArrowBigRightDash, ArrowDown } from "lucide-react";
interface IStudentDashboardProps {};

const StudentDashboard: FC<IStudentDashboardProps> = (props) => {
    return (
        <div className="p-4 bg-[#EEEEEE] w-screen h-screen flex flex-col ">
            <nav className="w-full flex items-center justify-between p-2 rounded-4xl bg-white">
                <div className="flex items-center gap-2">
                    <Image src={'/logo.png'} width={40} height={40} alt="Logo Not loaded" className="rounded-[50%]"/>
                    <h1 className="font-bold text-4xl">ACE </h1>
                </div>
                <div className="flex bg-gray-400/10 rounded-4xl overflow-hidden">
                    <ul className="flex items-center gap-1 ">
                        <li className="px-5 py-2 rounded-3xl "><a href="dashboard">My Course</a></li>
                        <li className="px-5 py-2 bg-[#393E46] text-white rounded-3xl "><a href="#">Dashboard</a></li>
                        <li className="px-5 py-2 rounded-3xl "><a href="#">AI-assistant</a></li>
                        <li className="px-5 py-2 rounded-3xl "><a href="mycourses">Typing</a></li>
                        <li className="px-5 py-2 rounded-3xl "><a href="#">Support</a></li>
                    </ul>
                </div>
                <div className="flex gap-5 items-center">
                    <HandHelpingIcon  size={28}/>
                    <BellDotIcon size={28}/>
                    <div className="profile">
                        <Image src={'/person.png'} alt="iamge not laoded" width={40} height={40} className="rounded-[50%] cursor-pointer"></Image>
                    </div>
                </div>
            </nav>
            <main className="mt-4 grid grid-cols-[1fr_2fr] gap-4 h-full ">
                <div className="profile bg-white row-span-2 rounded-3xl p-4 flex flex-col gap-5  justify-between">
                    <div className="first flex items-center justify-between">
                        <h1 className="text-2xl font-[500]">Statistic</h1>
                        <Link href='/statistic' className="px-4 py-1 bg-gray-400/10 rounded-4xl cursor-pointer">View all</Link>
                    </div>
                    <div className="second flex items-center justify-center flex-col">
                        <Image src={'/person.png'} width={160} height={120} className="rounded-[50%] border-2 border-gray-200 p-1 bg-[linear-gradient(to_top,blue_20%,transparent_30%)]" alt="image not loaded yet."/>
                        <h1 className="text-3xl">Welcome, Lakshya 👋</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-5xl">79%</h1>
                        <p className="text-gray-400 w-[20%] ">Total month activity</p>
                    </div>
                    <div className="flex items-center justify-between  text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-pink-400 p-4 rounded-full text-white">
                                <Clock2Icon />
                            </div>
                            <h1 className="text-2xl">9</h1>
                            <p className="text-gray-600">In Progress</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-yellow-400 p-4 rounded-full text-white">
                                <CalendarIcon/>
                            </div>
                            <h1 className="text-2xl">4</h1>
                            <p className="text-gray-600">Upcoming</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-orange-400 p-4 rounded-full text-white">
                                <BadgeCheck/>
                            </div>
                            <h1 className="text-2xl">15</h1>
                            <p className="text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="course bg-[#FF5722]/75 rounded-3xl">
                    <div className="p-2 flex items-center justify-between  mx-4 text-white">
                        <h1 className="text-3xl">Your cources</h1>
                        <div className="flex items-center gap-4">
                            <div className="slider-btn flex gap-2 px-4 py-1 rounded-xl bg-[#EEEEEE] text-black">
                                <ArrowBigLeftDash />
                                <ArrowBigRightDash />
                            </div>
                            <Link href={'#'} className="text-black px-4 py-1 rounded-xl bg-[#EEEEEE]">View all</Link>
                        </div>
                    </div>
                    <div className="second"></div>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="progress bg-white w-full rounded-3xl ">
                        <div className="p-2 flex items-center justify-between mx-4 text-black">
                            <h1 className="text-2xl">Study process</h1>
                            <Link href={'#'} className="text-black px-4 py-1 rounded-xl  flex ">Week <ArrowDown /></Link>
                        </div>
                        <div className="second"></div>
                    </div>
                    <div className="ai bg-black w-full rounded-3xl">
                        
                    </div>
                </div>
           </main>
        </div>
    );
}

export default StudentDashboard;