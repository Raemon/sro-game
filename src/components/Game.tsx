import React, { useEffect, useState } from 'react';
import Card from './Card';
import { createUseStyles } from 'react-jss';
import SunDial from './SunDial';
import ScalingField from './ScalingField';
import Draggable, { DraggableEvent } from 'react-draggable';
import { startingCards } from '../collections/cards';
import { createCardPosition } from '../collections/spawningUtils';
import { useCardPositions } from '../collections/useCardPositions';
import { CardPosition } from '../collections/types';
import { initial } from 'lodash';

export const debugging = false

export function handleStart(event: DraggableEvent) {
  event.stopPropagation();
}

const useStyles = createUseStyles({
  root: {
    backgroundSize: "cover",
    background: "Url('map2.jpg')",
    height: '100vh',
    width: '100vw',
  },
  map: {
    textAlign: 'center',
    // backgroundColor: 'white',
    // display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    height: '400%',
    width: '400%'
  },
  style: {
    border: 'solid 1px rgba(0,0,0,.2)',
    boxShadow: '0 40px 40px 0 rgba(0,0,0,0)',
    width: '95%',
    height: '95vh',
    position: "relative",
    top: '2.5vh',
    left: '2.5%',
    borderRadius: 6,
    overflow: "hidden",
    background: "rgba(220,210,200,.7)",
  },
  pauseScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    background: "rgba(0,0,0,.5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 100,
    zIndex: 9999
  }
});

function Game() {
  const classes = useStyles();
  const [hasSetInitialState, setHasSetInitialState] = useState(false);

  const initialCardPositions: Record<string, CardPosition> = {}

  if (!hasSetInitialState) {
    startingCards.forEach((slug, i) => {
      const cardPosition = createCardPosition(initialCardPositions, slug, 
        Math.round(i*25+260+Math.random()*100), 
        Math.round(200+Math.random()*100))
      initialCardPositions[cardPosition.id] = cardPosition
    }); 
    setHasSetInitialState(true)
  }

  const { cardPositions, setCardPositions, onDrag, onStop, isDragging } = useCardPositions(initialCardPositions);

  function removeUndefinedValues(obj: Record<string, CardPosition>): Record<string, CardPosition> {
    return Object.entries(obj).reduce((a, [k, v]) => (v === undefined ? a : {...a, [k]: v}), {});
  }
  const newCardPositions = removeUndefinedValues(cardPositions)

  useEffect(() => {
    localStorage.setItem('cardPositions', JSON.stringify(cardPositions));
  }, [cardPositions]); 

  const [dayCount, setDayCount] = useState(0);
  // const [lastMouseMoved, setLastMouseMoved] = useState(new Date().getTime());
  const [paused, setPaused] = useState(false);

  // function handleMouseMove() {
  //   setLastMouseMoved(new Date().getTime());
  // }

  // // useEffect(() => {
  // //   document.addEventListener('mousemove', handleMouseMove);
  // //   document.addEventListener('mousedown', handleMouseMove);
  // //   return () => {
  // //     document.removeEventListener('mousemove', handleMouseMove);
  // //     document.removeEventListener('mousedown', handleMouseMove);
  // //   };
  // // }, []);

  // // useEffect(() => {
  // //   function pauseCheckTimer () {
  // //     setTimeout(() => {
  // //       const mouseLastMoved = new Date().getTime() - lastMouseMoved;
  // //       if (mouseLastMoved > 10 * 1000) {
  // //         setPaused(true);
  // //       }
  // //       pauseCheckTimer()
  // //     }, 1000);
  // //   }
  // //   pauseCheckTimer()
  // // }, [lastMouseMoved]);
  return (
    <div className={classes.root}>
      {
        debugging &&
        <div style={{position: "absolute", top: 0, left: 0, zIndex: 9999}}>
        <button onClick={() => setPaused(!paused)}>Pause</button>
        {/* <div>Mouse moved {new Date().getTime() - lastMouseMoved}ms ago</div> */}
      </div>}
      {paused && <div className={classes.pauseScreen} onClick={() => setPaused(false)}>
        Paused
      </div>}
      <div className={classes.style}>
        <ScalingField>
          <Draggable onStart={handleStart}>
            <div className={classes.map}>
              {Object.values(newCardPositions).map(cardPosition => {
                if (!cardPosition) return null
                return <Card key={cardPosition.id} 
                  cardPositionInfo={{cardPositions, id:cardPosition.id, setCardPositions}} 
                  onDrag={onDrag} 
                  onStop={onStop}
                  paused={paused}
                  isDragging={isDragging}
                />
              })}
            </div>
          </Draggable>
        </ScalingField>
      </div>
      <SunDial dayCount={dayCount} setDayCount={setDayCount} />
    </div>
  );
}

export default Game;
