import React, { memo } from "react"
import { Typography } from "@material-ui/core"
import { ImageContainer } from "../ImageHeading"
import PromptTooltip from "../../../components/PromptTooltip"
import styled from '@emotion/styled';


export const ImageDisplay = memo(function ImageDisplay({ image }) {
    if (!image) {
        return (
            <ImageContainer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                }}
            >
                <div>
                    <Typography variant="h6" color="textSecondary">
                        Loading image...
                    </Typography>
                </div>
            </ImageContainer>
        );
    }

    return (
        <ImageContainer
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}
        >
            <div>
                {image.imageURL && (
                    <a href={image.imageURL} target="_blank" rel="noopener noreferrer">
                        <PromptTooltip title={image.prompt || ''} seed={image.seed}>
                            <ImageStyle src={image.imageURL} alt={image.prompt || 'Generated image'} />
                        </PromptTooltip>
                    </a>
                )}
            </div>
        </ImageContainer>
    );
})


const ImageStyle = styled.img`
  height: 600px;
  max-width: 100%;
  object-fit: contain;
`
