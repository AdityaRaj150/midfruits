
import { Player } from "../components/Player"
import { Music } from "../components/Music";
import { Fruits } from "../components/MagicItem";
import { ObstaclePosition } from "../components/Obstacle";
import { GameArena } from "../components/GameArena";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useSocket } from "../hooks/usesocket";
import { useEffect, useRef, useState } from "react";
import {
    activeRoomAtom,
    currentPlayerAtom,
    isRoomInvalidAtom,
    playersAtom,
    socketIdAtom,
    usernameAtom
} from "../store/atoms";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toast } from "../components/Toast";
import { Settings } from "lucide-react";
import { Background } from "../components/Background";
import { createPortal } from "react-dom";
import { PlayerBar } from "../components/playerBar";


export default function GamePage() {
    const [players, setPlayers] = useRecoilState(playersAtom)
    const { generateFruit } = useSocket()
    const [currentPlayer, setCurrentPlayer] = useRecoilState(currentPlayerAtom)
    const [username, setUsername] = useRecoilState(usernameAtom)
    const isRoomInvalid = useRecoilValue(isRoomInvalidAtom)

    const {
        getRoomData,
        connectSocket,
        checkRoomAvailibility,
        joinRoom } = useSocket()

    const [askUser, setAskUser] = useState(false)
    const usernameRef = useRef()
    const { gameId } = useParams()
    const socketId = useRecoilValue(socketIdAtom)
    const [activeRoom, setActiveRoom] = useRecoilState(activeRoomAtom)
    const [doesRoomExist, setDoesRoomExist] = useState(true)
    const [showToast, setShowToast] = useState(false)
    const [startGame, setStartGame] = useState(false)
    const [showSetting, setShowSetting] = useState(false)

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

    const handleClick = () => {

        if (usernameRef.current.value === "") {
            console.log('username cannot be empty');
            return
        }
        setUsername(usernameRef.current.value)
    }

    useEffect(() => {
        if (players?.gameHasStarted) {
            console.log("game starts!");
            setStartGame(true)
            generateFruit(activeRoom)
        }
    }, [players])

    useEffect(() => {

        if (username === "") {
            connectSocket()
            setAskUser(true)
        }
        else if (socketId) {

            setAskUser(false)
            setActiveRoom(gameId)
            joinRoom(gameId, username)

            checkRoomAvailibility();
            console.log("calling getroomdata from game.jsx")
            getRoomData(setPlayers, setCurrentPlayer, currentPlayer, doesRoomExist)
            console.log(askUser)

        }
    }, [username, socketId])


    if (askUser) {
        return <>
            {!doesRoomExist && <Toast setShowToast={setDoesRoomExist} showToast={doesRoomExist} msg="room does not exist" />}
            <div className="w-screen h-screen relative z-[20] bg-pink-200" ></div>
            <div className="bg-red-200 border-2 border-pink-300  w-fit z-[100] translate-x-[-50%] translate-y-[-50%] fixed top-0 left-1/2 flex flex-col my-96 text-xl p-10 m-auto rounded" ><input ref={usernameRef} placeholder="username" />
                <button onClick={handleClick} className="hover:scale-105 active:scale-95 bg-yellow-200" >ok</button>
            </div></>
    }
    else {
        return (<Background>
            {!doesRoomExist && <Toast setShowToast={setDoesRoomExist} showToast={doesRoomExist} msg="room does not exist" />}
            <AnimatePresence>{isRoomInvalid && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-fit flex flex-col text-xl gap-6 p-20 h-fit bg-pink-300 rounded-lg fixed z-50 translate-x-[-50%] left-1/2 top-1/2 translate-y-[-50%]" >
                <p>{isRoomInvalid}</p>
                <Link to="/" ><button className="rounded-full hover:scale-105 active:scale-95 duration-75 ease-linear bg-amber-300 p-2 " >Go to Home Page...</button></Link>
            </motion.div>}</AnimatePresence>
            {!players ? <>loading...</> :
                <GameArena>
                    <AnimatePresence>
                        {!startGame && <StartGamePanel players={players} />}
                    </AnimatePresence>

                    <Player />
                    <Music />
                    <ObstaclePosition />
                    {/* <Fruits />  */}
                    <motion.div onClick={() => setShowSetting(prev => !prev)}
                        className="fixed cursor-pointer z-50 active:scale-95 hover:scale-105 top-0 backdrop-blur-3xl right-0 " >
                        <Settings size={50} color="black" />
                    </motion.div>
                    <AnimatePresence>
                        {showSetting && <SettingPanel players={players} />}
                    </AnimatePresence>
                </GameArena>

            }</Background>)
    }

}


const StartGamePanel = ({ players }) => {
    const [startGame, setStartGame] = useState(false)
    let playersJoined = 0;
    for (let player of players.participants) {
        if (player.startGame) playersJoined++;
    }
    const val = (playersJoined / players.roomLimit) * 100;
    return (createPortal(<motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-screen h-screen z-10 fixed flex justify-center items-center "
    >
        <div className="p-10 rounded-md flex flex-col gap-2  fixed top-40  border-2  border-black
         bg-emerald-400 justify-center items-center text-xl z-40" >

            <h1 className="text-3xl text-amber-300 " >Game Rules:</h1>
            <p>fruits with prime numbers are worth +5 points</p>
            <p>fruits with even numbers except 2 are worth -5 points</p>
            <p>fruits with odd numbers are worth -3 points</p>
            <GameRoomBtn startGame={startGame} content="Start Game!"
                onClick={() => { setStartGame(true) }}
            />
            <p>{`${playersJoined} /${players.roomLimit} players have started the game`}</p>
            <PlayerBar val={val} />
        </div>


    </motion.div>, document.body))
}

const SettingPanel = ({ players }) => {
    const activeRoom = useRecoilValue(activeRoomAtom)
    return (<motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-10  text-2xl pt-12 rounded-md fixed z-40 top-0 gap-3  bg-gradient-to-tr border border-black from-green-300 via-green-400 to-emerald-400 right-0 flex flex-col">
        <p >{`Room name: ${activeRoom}`}</p>
        <div className="flex flex-col gap-2 text-lg " >
            {players.participants.map((p, ind) => <div className="flex  font-bold justify-between ">
                <p className=" text-amber-300 rounded-full p-1" >{p.playerName}</p>
                <p className="text-pink-300 " >{p.points} pts</p>
            </div>)}
        </div>
        <Link to='../../' >
            <GameRoomBtn
                onClick={() => { }}
                content="Leave room" />
        </Link>
    </motion.div>)
}


const GameRoomBtn = ({ content, onClick, startGame = false }) => {
    const { startGame: startGm } = useSocket()
    const setPlayers = useSetRecoilState(playersAtom)
    const activeRoom = useRecoilValue(activeRoomAtom)
    useEffect(() => {
        if (startGame)
            startGm(activeRoom, setPlayers)
    }, [activeRoom, startGame])
    return (<button
        disabled={startGame}
        onClick={onClick}
        className={`bg-amber-300 p-2 
            ${!startGame ? "active:scale-95 hover:scale-105" : "opacity-70"} w-full `} >{content}
    </button>)
}