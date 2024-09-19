import { usePollinationsText } from '@pollinations/react';
import React, { useEffect, useRef, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import styled from '@emotion/styled';
import { Box, TextField } from '@material-ui/core';

const ChessBoardContainer = styled.pre`
    font-family: monospace;
    width: 40ch;
    height: 30ch;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ChessBoardGenerator = (props) => {

    const [seed, setSeed] = useState(1266);

    // const prompt = "Generate a chess board configuration. Use ASCII characters for pieces. 8x8 grid. Place it in ```. Return only the characters, no other text or quotes.";

    // const prompt = "Return a random number between 1 and 100. Respond with the number and nothing else.";


    const initialBoardState = `
turn: black
r n b q k b n r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . P . . .
. . . . . . . .
P P P P . P P P
R N B Q K B N R
`;


    const prompt = `
\`\`\`
${initialBoardState}
\`\`\`
`;

    const systemPrompt = `You receive a chess board configuration and who is to move.
First you should decide on a move for the current player.
You should return a new chess board configuration with the move applied and the opponent to move.
Return in exactly the same format as the input.`;

    const chessBoard = usePollinationsText(prompt, { seed, model: "mistral", systemPrompt });

    const handleSeedChange = (event) => {
        setSeed(Number(event.target.value));
    };

    return (
        <Box margin={2} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <TextField
                label="Seed"
                type="number"
                value={seed}
                onChange={handleSeedChange}
                margin="normal"
            />
            <ChessBoardContainer style={props?.style}>
                {chessBoard}
            </ChessBoardContainer>
        </Box>
    );
}

export default ChessBoardGenerator;