import React, { useEffect, useState, useRef } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import usePlaySound from '../playsound';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from './playerCard';





const LobbyScreen = () => {
    const { audioRef, error, playSound, loadSound, seekTo, cancelSound, checkSound, soundEnabled, setSoundEnabled } = usePlaySound();

    const { user, userProfile, checkAuth } = useContext(AuthContext);

    const [opponentProfile, setOpponentProfile] = useState(null);
    const [prevOpponentProfile, setPrevOpponentProfile] = useState(null);
    const roundPosition = useRef(null);
    const [lobbyState, setLobbyState] = useState(null);
    const [roundTimeLeft, setRoundTimeLeft] = useState(null);
    const [showSoundPrompt, setShowSoundPrompt] = useState(true);

    // const playat=220;
    const playat=300;

    const navigate = useNavigate();


    async function leaveLobby(){
        const token = localStorage.getItem('access_token');
        cancelSound();
        const response = await fetch(window.server_url+'/disconnect_lobby', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            navigate('/');
        }
    }

    useEffect(() => {
        if (!checkSound()) {
            setSoundEnabled(false);
        } else {
            setSoundEnabled(true);
        }

        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('access_token');
                const isTabVisible = !document.hidden;
                const response = await fetch(window.server_url+'/lobby?is_visible='+isTabVisible, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'is_visible_t_f': (isTabVisible)?"t":"f"
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    if (data.status=="inactive"){
                        cancelSound();
                        navigate('/');

                    }
                    if (opponentProfile!=null) {
                        setPrevOpponentProfile(opponentProfile);
                    }
                    setOpponentProfile(data.opponent_profile);
                    setLobbyState(data.lobby_state);
                    roundPosition.current = data.round_time_left;
                    setRoundTimeLeft(data.round_time_left);
             
                    if ((roundPosition.current!=null) && (data.lobby_state=="active")) {
                        seekTo(playat-roundPosition.current);
                        console.log("seeking to", playat-roundPosition.current);
                    }
                }
            } catch (error) {
                console.error("Error fetching lobby data:", error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const SoundPrompt = () => {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    position: 'relative',
                    minWidth: '300px'
                }}>
                    <button 
                        onClick={() => setShowSoundPrompt(false)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            border: 'none',
                            background: 'none',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                    <h2 style={{ marginTop: '20px' }}>Enable Sound</h2>
                    <p>Please enable sound for the best experience</p>
                    <button 
                        onClick={() => {
                            loadSound();
                            setShowSoundPrompt(false);
                        }}
                        style={{
                            padding: '10px 20px',
                            marginTop: '20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Enable Sound
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="lobby-container">
            <div className="lobby-content">
                <div className="lobby-header">
                    <h1>
                        {lobbyState === "active" 
                            ? "Round: Active\n" 
                            : "Waiting for Next Round"}
                        {roundTimeLeft && <span className="time-left">Time Left: {roundTimeLeft}s</span>}
                    </h1>
                </div>

                <div className="player-section">
                    {lobbyState === "active" ? (
                        opponentProfile ? (
                            <PlayerCard player={opponentProfile} />
                        ) : (
                            <div className="status-message">
                                <h2>Looking for opponent...</h2>
                            </div>
                        )
                    ) : (
                        <div className="status-message">
                            {prevOpponentProfile ? (
                                <h2>Previous round was with {prevOpponentProfile.name}</h2>
                            ) : (
                                <h2>Get ready for your first round!</h2>
                            )}
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <button className="primary-button" onClick={leaveLobby}>Leave Lobby</button>
                    <button className="secondary-button" onClick={loadSound}>
                        {soundEnabled ? 'Sound On' : 'Sound Off'}
                    </button>
                </div>
            </div>
            {(soundEnabled || !showSoundPrompt) ? null : <SoundPrompt />}
        </div>
    );
}

export default LobbyScreen;
