import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import PropTypes from "prop-types";
import Logo from "./components/Logo";
import theme from "./theme";
import "./App.css";

//MUI
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";

//Icons
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import NextIcon from "@material-ui/icons/ExposurePlus1";
import ResetIcon from "@material-ui/icons/ReplayOutlined";
import RandomIcon from "@material-ui/icons/Casino";
import GitHubIcon from "@material-ui/icons/GitHub";

const styles = {
    ...theme.app,
};

let numRows = 20;
let numCols = 15;

const neighbourCoordinates = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0],
];

const generateBoard = (rows, cols) => {
    return Array(rows)
        .fill(0)
        .map((row) => new Array(cols).fill(0));
};

function App(props) {
    const { classes } = props;
    const [board, setBoard] = useState(generateBoard(numRows, numCols));
    const [isStarted, setIsStarted] = useState(false);
    const isStartedRef = useRef(isStarted);
    isStartedRef.current = isStarted;

    const nextTurn = useCallback(() => {
        return (
            setBoard((currentBoard) => {
                return produce(currentBoard, (boardCopy) => {
                    for (let i = 0; i < numRows; i++) {
                        for (let j = 0; j < numCols; j++) {
                            let neighbors = 0;
                            neighbourCoordinates.forEach(([x, y]) => {
                                const newI = i + x;
                                const newJ = j + y;
                                if (
                                    newI >= 0 &&
                                    newI < numRows &&
                                    newJ >= 0 &&
                                    newJ < numCols
                                ) {
                                    neighbors += currentBoard[newI][newJ];
                                }
                            });

                            if (neighbors < 2 || neighbors > 3) {
                                boardCopy[i][j] = 0;
                            } else if (
                                currentBoard[i][j] === 0 &&
                                neighbors === 3
                            ) {
                                boardCopy[i][j] = 1;
                            }
                        }
                    }
                });
            }),
            []
        );
    });

    const loop = useCallback(() => {
        if (!isStartedRef.current) {
            return;
        }
        nextTurn();
        setTimeout(loop, 200);
    }, []);

    const handleStartStop = () => {
        setIsStarted(!isStarted);
        if (!isStarted) {
            isStartedRef.current = true;
            loop();
        }
    };

    const handleNext = () => {
        setIsStarted(false);
        if (isStarted) {
            isStartedRef.current = false;
        }
        nextTurn();
    };

    const handleClear = () => {
        setBoard(generateBoard(numRows, numCols));
    };
    const printBoard = () => {
        return board.map((rows, i) =>
            rows.map((col, k) => (
                <div
                    className={classes.boardGrid}
                    key={`${i}-${k}`}
                    onClick={() => {
                        const nextBoard = produce(board, (boardCopy) => {
                            boardCopy[i][k] = board[i][k] ? 0 : 1;
                        });
                        setBoard(nextBoard);
                    }}
                >
                    <Fade in={Boolean(board[i][k])}>
                        <div
                            className={classes.cell}
                            style={{
                                backgroundColor: board[i][k]
                                    ? "#4EBC7C"
                                    : undefined,
                            }}
                        ></div>
                    </Fade>
                </div>
            ))
        );
    };

    const handleInitRandom = () => {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            rows.push(
                Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
        }

        setBoard(rows);
    };

    return (
        <Grid
            container
            className={classes.appContainer}
            direction="column"
            alignItems="center"
        >
            <Grid className={classes.logo} item xs={12}>
                <Logo intensity={1} blur={2} />
            </Grid>
            <Grid item xs={12} className={classes.buttonContainer}>
                <Button
                    className={classes.controlButton}
                    onClick={handleStartStop}
                >
                    {isStarted ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <Button className={classes.controlButton} onClick={handleNext}>
                    <NextIcon />
                </Button>
                <Button
                    className={classes.controlButton}
                    onClick={handleInitRandom}
                >
                    <RandomIcon />
                </Button>
                <Button className={classes.controlButton} onClick={handleClear}>
                    <ResetIcon />
                </Button>
            </Grid>
            <Grid item xs={12} className={classes.boardContainer}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${numCols}, 20px)`,
                    }}
                >
                    {printBoard()}
                </div>
            </Grid>
            <Grid item xs={12} className={classes.footer}>
                <a href="https://github.com/nk-io/react-game-of-life" target="_blank">
                    <Button
                        className={classes.controlButton}
                        onClick={handleClear}
                    >
                        <GitHubIcon />
                    </Button>
                </a>
            </Grid>
        </Grid>
    );
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
