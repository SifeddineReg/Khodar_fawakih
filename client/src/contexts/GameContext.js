import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  player: null,
  room: null,
  gameState: 'lobby', // lobby, playing, scoring, finished
  currentRound: 0,
  totalRounds: 5,
  timeLeft: 60,
  currentLetter: '',
  categories: ['فواكه', 'خضار', 'حيوان', 'بلد', 'جماد', 'لون'],
  answers: {},
  players: [],
  scores: {},
  roundResults: [],
  isHost: false,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload };
    
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    
    case 'SET_CURRENT_LETTER':
      return { ...state, currentLetter: action.payload };
    
    case 'SET_ANSWERS':
      return { ...state, answers: action.payload };
    
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    
    case 'SET_SCORES':
      return { ...state, scores: action.payload };
    
    case 'SET_ROUND_RESULTS':
      return { ...state, roundResults: action.payload };
    
    case 'SET_IS_HOST':
      return { ...state, isHost: action.payload };
    
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.category]: action.payload.answer,
        },
      };
    
    case 'RESET_GAME':
      return {
        ...initialState,
        player: state.player,
        room: state.room,
        isHost: state.isHost,
      };
    
    default:
      return state;
  }
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
