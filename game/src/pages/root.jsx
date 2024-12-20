import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useNavigate } from "react-router";
import { useSocket } from "../hooks/usesocket";
import { useEffect, useRef } from "react";
import { Title } from "../components/title";
import { isRoomInvalidAtom, usernameAtom } from "../store/atoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Background } from "../components/Background";
import { Analytics } from "@vercel/analytics/next";
export const Root = ({ children }) => {
    const [username, setUsername] = useRecoilState(usernameAtom)
    const navigate = useNavigate()
    const usernameRef = useRef()
    const setIsRoomInvalid = useSetRecoilState(isRoomInvalidAtom)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 900) {
                alert("open this website in laptop/bigger screen to view the buggy version!!");
            }
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

  
    const { connectSocket } = useSocket()
    useEffect(() => {
        connectSocket();
        setUsername("")
        setIsRoomInvalid(null)
    }, [])

    const handleClick = () => {
        if (usernameRef.current.value === "") {
            console.log("naam to dalo")
        }
        setUsername(usernameRef.current.value)
        setTimeout(() => {
            painSound.play()
        }, 1000);
        navigate("home")

    }

    const painSound = new Audio("/assets/deadpoolsound.mp3")

    return (<Background>
         <Title />
            <AnimatePresence>
                {username === ""  && <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, }}
                    transform={{ duration: 1 }}
                    className="fixed z-50 rounded-full flex justify-center items-center bg-pink-300 p-60 left-1/2 top-1/2  translate-x-[-50%] translate-y-[-50%] " ><dialog className="rounded-lg p-8" open>
                        <div className="flex flex-col" >
                            <p className="pixelify-sans m-auto my-4 text-2xl" > Welcome to MidFruits</p>
                            <input ref={usernameRef} className="p-2 rounded-lg bg-slate-100 text-lg pixelify-sans" placeholder="username" />
                            <button onClick={handleClick} className="cursor-pointer hover:bg-amber-300 px-6 py-2 active:scale-95 bg-amber-200 pixelify-sans" >ok</button>
                        </div>

                    </dialog></motion.div>}
            </AnimatePresence>
            <Outlet>{children}</Outlet>
            <Analytics />
    </Background>

    );
}