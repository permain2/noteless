import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

// Reusable component for each section in the editor (Anamnese, Funn, etc.)
const NoteSection = ({ title, children, showSeparator = true }) => (
    <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>{title}</Text>
        {children}
        {showSeparator && <View style={styles.separator} />}
    </View>
);

// Reusable component for input fields within sections
const SectionInput = ({ label, value, onChangeText, multiline, numberOfLines, placeholder }) => (
    <View style={styles.sectionInputContainer}>
        {label && <Text style={styles.sectionInputLabel}>{label}</Text>}
        <TextInput
            style={[styles.textInput, multiline && styles.multilineTextInput]}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
        />
    </View>
);

const EditorView = () => {
    // State for active tab and form fields (will be expanded)
    const [activeTab, setActiveTab] = useState('Notat');
    const [anamnese, setAnamnese] = useState('45 år gammel mann, tidligere frisk, bruker ingen faste medisiner. Kommer grunnet smerter i nedre del av ryggen som har vart i to uker. Smerterie oppsto plutselig etter å ha løftet en tung gjenstand på jobb. Beskriver smerten som konstant NRS 6, forverres ved bevegelse og lindres noe ved hvile. Har prøvd Paracet uten betydelig effekt. Ingen nummenhet eller kraftsvikt i bena.');
    const [inspeksjon, setInspeksjon] = useState('Ingen synlig hevelse eller rødhet i lumbalregionen');
    const [palpasjon, setPalpasjon] = useState('Ømhet over lumbal muskulatur');
    const [mobilitet, setMobilitet] = useState('Redusert fleksjon og ekstensjon i lumbalcolumna');
    const [nevrologi, setNevrologi] = useState('Normal kraft, sensibilitet og reflekser i underekstremitetene');
    const [vurdering, setVurdering] = useState('Lumbago, uten tegn til nevrologisk utfall.');
    const [tiltak, setTiltak] = useState('- Informert om røde flagg\n- Anbefale hvile og unngå tunge løft\n- Forsøke NSAIDs ved behov for smertelindring\n- Kontrolltime om to uker for vurdering av effekt og videre plan');

    const renderContent = () => {
        switch (activeTab) {
            case 'Notat':
                return (
                    <ScrollView style={styles.editorScrollView}>
                        <Text style={styles.currentConsultationTitle}>Lumbago</Text>
                        
                        <NoteSection title="Anamnese">
                            <SectionInput value={anamnese} onChangeText={setAnamnese} multiline numberOfLines={6} />
                        </NoteSection>

                        <NoteSection title="Funn">
                            <SectionInput label="Inspeksjon:" value={inspeksjon} onChangeText={setInspeksjon} multiline numberOfLines={2}/>
                            <SectionInput label="Palpasjon:" value={palpasjon} onChangeText={setPalpasjon} multiline numberOfLines={2}/>
                            <SectionInput label="Mobilitet:" value={mobilitet} onChangeText={setMobilitet} multiline numberOfLines={2}/>
                            <SectionInput label="Nevrologi:" value={nevrologi} onChangeText={setNevrologi} multiline numberOfLines={2}/>
                        </NoteSection>

                        <NoteSection title="Vurdering">
                            <SectionInput value={vurdering} onChangeText={setVurdering} multiline numberOfLines={3}/>
                        </NoteSection>

                        <NoteSection title="Tiltak" showSeparator={false}> 
                            <SectionInput value={tiltak} onChangeText={setTiltak} multiline numberOfLines={5}/>
                        </NoteSection>
                    </ScrollView>
                );
            case 'Henvisning':
                return <Text style={styles.tabContentPlaceholder}>Henvisning Content</Text>;
            case 'Transkripsjon':
                return <Text style={styles.tabContentPlaceholder}>Transkripsjon Content</Text>;
            default:
                return null;
        }
    };

    return (
        <View style={styles.editorContainer}>
            {/* Top Bar: Date and Tabs */}
            <View style={styles.topBar}>
                <Text style={styles.dateText}>10:20 / 04.10.2024</Text>
                <View style={styles.tabsContainer}>
                    {['Notat', 'Henvisning', 'Transkripsjon'].map(tab => (
                        <TouchableOpacity 
                            key={tab} 
                            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Main Content Area */}
            <View style={styles.mainContentArea}>
                {renderContent()}
            </View>

            {/* Bottom Action Buttons */}
            <View style={styles.bottomActionsBar}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Kopier alt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                    <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Gjenoppta konsultasjon</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonTertiary]}>
                    <Text style={[styles.actionButtonText, styles.actionButtonTextTertiary]}>Regenerer notat</Text>
                </TouchableOpacity>
                 {/* Placeholder for potential up/down arrow for Regenerer notat */}
            </View>
            <Text style={styles.infoText}>Noteless kan gjøre feil. Sjekk viktig informasjon.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    editorContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    dateText: {
        fontSize: 14,
        color: '#6b7280',
    },
    tabsContainer: {
        flexDirection: 'row',
    },
    tabItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6, // For a slightly pill-shaped background on active
        marginHorizontal: 4,
    },
    activeTabItem: {
        backgroundColor: '#e0e7ff', // Light indigo for active tab background
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    activeTabText: {
        color: '#3730a3', // Indigo text for active tab
    },
    mainContentArea: {
        flex: 1,
        padding: 20, // Padding for the content itself
    },
    editorScrollView: {
        flex: 1,
    },
    currentConsultationTitle: {
        fontSize: 26, // Larger title for current note
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 25,
    },
    noteSection: {
        marginBottom: 20,
    },
    noteSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    sectionInputContainer: {
        marginBottom: 10,
    },
    sectionInputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1f2937',
    },
    multilineTextInput: {
        textAlignVertical: 'top', // Important for multiline inputs
        minHeight: 60, // Default min height, can be adjusted by numberOfLines
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 20, // Space around separator
    },
    tabContentPlaceholder: {
        padding: 20,
        fontSize: 16,
        color: '#6b7280',
    },
    bottomActionsBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    actionButton: {
        backgroundColor: '#3730a3', // Primary button color (indigo)
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginRight: 10,
    },
    actionButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    actionButtonSecondary: {
        backgroundColor: '#e0e7ff', // Lighter indigo
    },
    actionButtonTextSecondary: {
        color: '#3730a3', // Indigo text
    },
    actionButtonTertiary: {
        backgroundColor: '#f3f4f6', // Light gray
    },
    actionButtonTextTertiary: {
        color: '#374151', // Dark gray text
    },
    infoText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        paddingVertical: 8,
        backgroundColor: '#ffffff', // Match bottom bar background
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    }
});

export default EditorView; 