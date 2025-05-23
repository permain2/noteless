import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

import Sidebar from '../components/Sidebar';
import EditorView from '../components/EditorView';
import DictationModal from '../components/DictationModal';

// Add debugging logs
console.log('HomeScreen.js: Loading HomeScreen component');

const HomeScreen = () => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isDictationModalVisible, setIsDictationModalVisible] = useState(false);

    useEffect(() => {
        console.log('HomeScreen.js: HomeScreen component mounted');
        getUserData();
        return () => console.log('HomeScreen.js: HomeScreen component unmounted');
    }, []);

    const getUserData = async () => {
        console.log('HomeScreen.js: Getting user data');
        setLoading(true);
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            console.log('HomeScreen.js: User data response:', user ? 'Has user' : 'No user', error ? `Error: ${error.message}` : 'No error');
            
            if (error) {
                console.error('HomeScreen.js: Get user error:', error);
                setError(error.message);
            } else {
                setUserData(user);
                console.log('HomeScreen.js: User data retrieved successfully');
            }
        } catch (err) {
            console.error('HomeScreen.js: Exception in getUserData:', err);
            setError(err.message || 'Feil ved henting av brukerdata');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        console.log('HomeScreen.js: Signing out');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('HomeScreen.js: Sign out error:', error);
                Alert.alert('Utloggingsfeil', error.message);
            } else {
                console.log('HomeScreen.js: Sign out successful');
            }
        } catch (err) {
            console.error('HomeScreen.js: Exception during sign out:', err);
            Alert.alert('Feil', 'En uventet feil oppstod under utlogging. Vennligst prøv igjen.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3730a3" />
                <Text style={styles.loadingText}>Laster...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Feil: {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={getUserData}>
                    <Text style={styles.buttonText}>Prøv igjen</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.appContainer}>
                <View style={styles.sidebarContainer}>
                    <Sidebar onOpenDictationModal={() => setIsDictationModalVisible(true)} />
                </View>

                <View style={styles.editorViewContainer}>
                    <EditorView />
                </View>
            </View>
            <DictationModal 
                visible={isDictationModalVisible} 
                onClose={() => setIsDictationModalVisible(false)} 
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5', // A light background color for the whole app
    },
    appContainer: {
        flex: 1,
        flexDirection: 'row', // Arrange sidebar and editor side-by-side
    },
    sidebarContainer: { // Renamed from sidebar to avoid conflict with component
        width: 280, // Fixed width for the sidebar, adjust as needed
        backgroundColor: '#ffffff', // Sidebar background
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
    },
    editorViewContainer: { 
        flex: 1, 
        // backgroundColor is handled by EditorView itself now
        // padding is also handled by EditorView for its content area
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1f2937',
    },
    email: {
        fontSize: 16,
        marginBottom: 20,
        color: '#4b5563',
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: '#4b5563',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
    button: {
        backgroundColor: '#3730a3',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4b5563',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#3730a3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
});

export default HomeScreen; 