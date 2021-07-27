import React, { useState, useEffect } from 'react'

export function usePanel() {
    const [panes, setPanes] = useState([]);
    const [activePane, setActivePane] = useState('');

    const updatePanes = (updatedPanes) => {
        setPanes(updatedPanes);
    }

    const addPane = (newPane) => {
        setPanes((prev) => {
            return [...prev, newPane];
        })
    };

    const activatePane = (panekey) => {
        setActivePane(panekey);
    }
    const removePane = (paneKey) => {
        const panesFiltered = panes.filter((pane) => pane.key !== paneKey);
        setPanes(panesFiltered);
    }
    return {
        panes,
        activePane,
        updatePanes,
        addPane,
        activatePane, removePane,
    }

}