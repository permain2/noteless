import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust path as necessary

// Add debugging logs
console.log('AuthScreen.js: Loading AuthScreen component');

const VALIDATION = {
    EMAIL: {
        MIN_LENGTH: 5,
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 6
    }
};

const AuthScreen = () => {
    useEffect(() => {
        console.log('AuthScreen.js: AuthScreen component mounted');
        return () => console.log('AuthScreen.js: AuthScreen component unmounted');
    }, []);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isRetrying, setIsRetrying] = useState(false);

    // Form validation functions
    const validateEmail = (email) => {
        if (!email || email.trim() === '') {
            return 'E-postadresse er påkrevd';
        }
        
        if (email.length < VALIDATION.EMAIL.MIN_LENGTH) {
            return 'E-postadressen er for kort';
        }
        
        if (!VALIDATION.EMAIL.PATTERN.test(email)) {
            return 'Ugyldig e-postformat';
        }
        
        return null;
    };
    
    const validatePassword = (password, isSignUp = false) => {
        if (!password || password.trim() === '') {
            return 'Passord er påkrevd';
        }
        
        if (isSignUp && password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
            return `Passordet må være minst ${VALIDATION.PASSWORD.MIN_LENGTH} tegn`;
        }
        
        return null;
    };
    
    // Handle form validation
    const validateForm = (isSignUp = false) => {
        const newErrors = {};
        
        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;
        
        const passwordError = validatePassword(password, isSignUp);
        if (passwordError) newErrors.password = passwordError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function signInWithEmail() {
        console.log('AuthScreen.js: signInWithEmail called with email:', email);
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            console.log('AuthScreen.js: Calling supabase.auth.signInWithPassword');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            console.log('AuthScreen.js: Login response:', data ? 'Has data' : 'No data', error ? `Error: ${error.message}` : 'No error');
            
            if (error) {
                console.error('AuthScreen.js: Login error:', error);
                
                // Handle specific errors with more user-friendly messages
                if (error.message.includes('Invalid login credentials')) {
                    Alert.alert('Påloggingsfeil', 'Feil e-postadresse eller passord. Vennligst prøv igjen.');
                } else {
                    Alert.alert('Feil', error.message);
                }
                
                // If we're on web, handle potential connectivity issues
                if (Platform.OS === 'web' && !isRetrying && (error.message.includes('network') || error.message.includes('connection'))) {
                    setIsRetrying(true);
                    setTimeout(() => {
                        setIsRetrying(false);
                        signInWithEmail();
                    }, 2000);
                    return;
                }
            } else {
                console.log('AuthScreen.js: Login successful');
            }
        } catch (e) {
            console.error('AuthScreen.js: Exception during login:', e);
            Alert.alert('Feil', 'En uventet feil oppstod. Vennligst prøv igjen.');
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail() {
        console.log('AuthScreen.js: signUpWithEmail called with email:', email);
        
        if (!validateForm(true)) {
            return;
        }
        
        setLoading(true);
        try {
            console.log('AuthScreen.js: Calling supabase.auth.signUp with validated form data');
            // Ensure we're using the latest Supabase client
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
            });
            
            console.log('AuthScreen.js: Registration response received:', 
                data ? 'Data present' : 'No data', 
                error ? `Error: ${error.message}` : 'No error');
            
            if (error) {
                console.error('AuthScreen.js: Registration error details:', {
                    message: error.message,
                    status: error.status,
                    code: error?.code,
                    hint: error?.hint || 'No hint provided'
                });
                
                // Handle specific errors with more user-friendly messages
                if (error.message.includes('already registered')) {
                    Alert.alert('Registreringsfeil', 'Denne e-postadressen er allerede registrert. Prøv å logge inn i stedet.');
                } else if (error.message.includes('password')) {
                    Alert.alert('Svakt passord', 'Passordet må være minst 6 tegn langt og inneholde tall og bokstaver.');
                } else if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('failed')) {
                    const retryDelay = isRetrying ? 4000 : 2000; // Exponential backoff
                    
                    Alert.alert(
                        'Nettverksproblem', 
                        'Ser ut som det er nettverksproblemer. Vi prøver igjen automatisk...',
                        [{ text: 'OK' }],
                        { cancelable: true }
                    );
                    
                    // If we're not already retrying, set up retry with exponential backoff
                    if (!isRetrying) {
                        console.log(`AuthScreen.js: Setting up retry in ${retryDelay}ms due to network error`);
                        setIsRetrying(true);
                        setTimeout(() => {
                            console.log('AuthScreen.js: Executing scheduled retry for registration');
                            signUpWithEmail();
                        }, retryDelay);
                        return;
                    }
                } else {
                    Alert.alert('Registreringsfeil', `Feil ved registrering: ${error.message}`);
                }
            } else if (!data.session) {
                // This usually means email confirmation is required if enabled in Supabase settings.
                console.log('AuthScreen.js: No session returned, likely needs email confirmation. User data:', 
                    data.user ? `User ID: ${data.user.id}` : 'No user data');
                
                // Profile will be created automatically by the database trigger
                Alert.alert('Registrering vellykket', 'Sjekk e-posten din for en bekreftelseslenke!');
            } else {
                console.log('AuthScreen.js: Registration successful with session. User logged in automatically.');
                
                // Profile will be created automatically by the database trigger
                Alert.alert('Vellykket!', 'Kontoen din er opprettet og du er nå innlogget.');
            }
        } catch (e) {
            console.error('AuthScreen.js: Unexpected exception during registration:', e);
            if (typeof window !== 'undefined') {
                // Log additional details for browser environment
                console.error('AuthScreen.js: Browser details:', {
                    userAgent: window.navigator.userAgent,
                    online: window.navigator.onLine,
                    time: new Date().toISOString()
                });
                // Store in localStorage for debugging
                try {
                    const errors = JSON.parse(localStorage.getItem('noteless_reg_errors') || '[]');
                    errors.push({
                        time: new Date().toISOString(),
                        error: e.message,
                        stack: e.stack,
                        email: email.replace(/[^@]+@/, '***@') // Partially redact email
                    });
                    localStorage.setItem('noteless_reg_errors', JSON.stringify(errors.slice(-10)));
                } catch (storageError) {
                    console.error('Failed to log to localStorage:', storageError);
                }
            }
            
            // Try one more time if this is a network error
            if (!isRetrying && e.message && (
                e.message.includes('network') || 
                e.message.includes('connection') || 
                e.message.includes('failed')
            )) {
                console.log('AuthScreen.js: Network error detected, scheduling one retry');
                setIsRetrying(true);
                setTimeout(() => {
                    signUpWithEmail();
                }, 3000);
                return;
            }
            
            Alert.alert('Feil', 'En uventet feil oppstod. Vennligst prøv igjen senere.');
        } finally {
            if (isRetrying) {
                // Only reset loading state if we're not retrying
                setIsRetrying(false);
            }
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.header}>Noteless Journal</Text>
                <Text style={styles.subHeader}>Logg inn eller registrer deg</Text>
                
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) {
                                const newErrors = {...errors};
                                delete newErrors.email;
                                setErrors(newErrors);
                            }
                        }}
                        value={email}
                        placeholder="E-postadresse"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#9ca3af"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
                
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) {
                                const newErrors = {...errors};
                                delete newErrors.password;
                                setErrors(newErrors);
                            }
                        }}
                        value={password}
                        secureTextEntry
                        placeholder="Passord"
                        autoCapitalize="none"
                        placeholderTextColor="#9ca3af"
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity 
                    style={[styles.button, styles.signInButton, loading && styles.buttonDisabled]} 
                    onPress={signInWithEmail} 
                    disabled={loading}
                >
                    {loading && !isRetrying ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.buttonText}>{isRetrying ? 'Prøver igjen...' : 'Logg inn'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.signUpButton, loading && styles.buttonDisabled]} 
                    onPress={signUpWithEmail} 
                    disabled={loading}
                >
                    {loading && isRetrying ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.buttonText}>{loading ? 'Registrerer...' : 'Registrer ny bruker'}</Text>
                    )}
                </TouchableOpacity>
                
                {/* Add a help text */}
                <Text style={styles.helpText}>
                    Opplever du problemer med registrering? Kontroller at passordet inneholder minst 6 tegn.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 30,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 18,
        color: '#4b5563',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 50,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1f2937',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 5,
        marginLeft: 5,
    },
    button: {
        height: 50,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    signInButton: {
        backgroundColor: '#3730a3', // Indigo
    },
    signUpButton: {
        backgroundColor: '#10b981', // Emerald
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    helpText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        marginTop: 20,
    },
});

export default AuthScreen; 