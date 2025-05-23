import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Audio } from 'expo-av';

// Placeholder for icons
// import { Ionicons } from '@expo/vector-icons'; 

const DictationModal = ({ visible, onClose }) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // To handle pause state
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [audioUri, setAudioUri] = useState(null); // To store URI of the recording

    useEffect(() => {
        return () => {
            // Clean up recording if modal is closed while recording
            if (recording) {
                stopRecording(true); // Pass true to indicate cleanup
            }
        };
    }, [recording]);

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            if (permissionResponse.status === 'granted') { // Re-check after requesting
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                console.log('Starting recording..');
                const { recording: newRecording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(newRecording);
                setIsRecording(true);
                setIsPaused(false);
                setAudioUri(null); // Clear previous URI
                console.log('Recording started');
            } else {
                console.log('Permission to record audio not granted');
                // Optionally, show an alert to the user
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording(isCleanup = false) {
        if (!recording) return;
        console.log('Stopping recording..');
        setIsRecording(false);
        setIsPaused(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setAudioUri(uri);
            console.log('Recording stopped and stored at', uri);
            if (!isCleanup) {
                // Here you would typically handle the URI, e.g., pass to transcription service
                // For now, we just log it and prepare for a new recording session
            }
        } catch (error) {
            console.error('Failed to stop or unload recording', error);
        }
        setRecording(null); // Prepare for a new recording session
    }

    async function pauseRecording() {
        if (!recording || !isRecording) return;
        try {
            if (isPaused) { // If paused, resume
                console.log('Resuming recording..');
                await recording.startAsync(); // For some versions, this might be different e.g. playAsync()
                setIsPaused(false);
            } else { // If recording, pause
                console.log('Pausing recording..');
                await recording.pauseAsync();
                setIsPaused(true);
            }
        } catch (error) {
            console.error('Failed to pause/resume recording', error);
        }
    }

    function handleDeleteRecording() {
        if (recording) {
            stopRecording(true); // Stop and cleanup
        }
        setAudioUri(null);
        console.log('Recording deleted');
        // Potentially close modal or reset for new recording
    }

    function handleNewRecording() {
        handleDeleteRecording(); // Clear existing one
        startRecording(); // Start a fresh one
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} // For Android back button
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Ny diktering</Text>
                    
                    {/* Display recording status or URI */}
                    {isRecording && <Text style={styles.statusText}>{isPaused ? 'Pauset' : 'Spiller inn...'}</Text>}
                    {audioUri && !isRecording && <Text style={styles.statusText}>Innspilling ferdig. Trykk Nytt for å starte på nytt.</Text>}
                    
                    <View style={styles.controlsContainer}>
                        {!isRecording && !isPaused && (
                            <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={startRecording}>
                                {/* <Ionicons name="mic-outline" size={24} color="white" /> */}
                                <Text style={styles.controlButtonText}>Start</Text>
                            </TouchableOpacity>
                        )}

                        {isRecording && (
                            <TouchableOpacity style={[styles.controlButton, isPaused ? styles.resumeButton : styles.pauseButton]} onPress={pauseRecording}>
                                {/* <Ionicons name={isPaused ? "play-outline" : "pause-outline"} size={24} color="white" /> */}
                                <Text style={styles.controlButtonText}>{isPaused ? 'Fortsett' : 'Pause'}</Text>
                            </TouchableOpacity>
                        )}
                        
                        {(isRecording || isPaused) && (
                             <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={() => stopRecording(false)}>
                                {/* <Ionicons name="stop-outline" size={24} color="white" /> */}
                                <Text style={styles.controlButtonText}>Stopp</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.secondaryControlsContainer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleDeleteRecording}>
                            {/* <Ionicons name="trash-outline" size={20} color="#ef4444" /> */}
                            <Text style={[styles.secondaryButtonText, {color: '#ef4444'}]}>Slett</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleNewRecording}>
                            {/* <Ionicons name="refresh-outline" size={20} color="#3b82f6" /> */}
                            <Text style={[styles.secondaryButtonText, {color: '#3b82f6'}]}>Nytt</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Lukk</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    statusText: {
        fontSize: 16,
        color: '#4b5563',
        marginBottom: 20,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 25,
    },
    controlButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    controlButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5, // If using icons
    },
    startButton: {
        backgroundColor: '#22c55e', // Green
    },
    pauseButton: {
        backgroundColor: '#f59e0b', // Amber
    },
    resumeButton: {
        backgroundColor: '#3b82f6', // Blue
    },
    stopButton: {
        backgroundColor: '#ef4444', // Red
    },
    secondaryControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    secondaryButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontWeight: '500',
        fontSize: 14,
        marginLeft: 5, // If using icons
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#3b82f6',
        fontWeight: '500',
    },
});

export default DictationModal; 