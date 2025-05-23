import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Placeholder for an icon component if you decide to use one (e.g., from expo/vector-icons)
// const Icon = ({ name }) => <Text>{name}</Text>; 

const SidebarButton = ({ title, onPress, iconName, style, textStyle }) => (
    <TouchableOpacity style={[styles.sidebarButton, style]} onPress={onPress}>
        {/* {iconName && <Icon name={iconName} />} */}
        <Text style={[styles.sidebarButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
);

const NoteListItem = ({ title, time, isActive }) => (
    <TouchableOpacity style={[styles.noteItem, isActive && styles.noteItemActive]}>
        <Text style={[styles.noteItemTitle, isActive && styles.noteItemTitleActive]}>{title}</Text>
        <Text style={[styles.noteItemTime, isActive && styles.noteItemTimeActive]}>{time}</Text>
    </TouchableOpacity>
);

const Sidebar = ({ onOpenDictationModal, userEmail, onSignOut }) => {
    // Placeholder data
    const todayNotes = [
        { id: '1', title: 'Lumbago', time: '00:00', isActive: true },
        { id: '2', title: 'hypertyreose', time: '00:00' },
        { id: '3', title: 'Pneumoni', time: '00:00' },
        { id: '4', title: 'Nakkesmerter', time: '00:00' },
    ];

    const yesterdayNotes = [
        { id: '5', title: 'Sitrusallergi', time: '00:00' },
        { id: '6', title: 'Senebetennelse', time: '00:00' },
    ];

    return (
        <View style={styles.sidebarContainer}>
            <View style={styles.logoSection}>
                <Text style={styles.logoText}>noteless</Text>
                {userEmail && (
                    <Text style={styles.userEmail}>{userEmail}</Text>
                )}
            </View>

            <View style={styles.actionsSection}>
                <SidebarButton title="Ny konsultasjon" onPress={() => { /* Will implement later */ }} />
                <SidebarButton title="Ny diktering" onPress={onOpenDictationModal} />
            </View>

            <ScrollView style={styles.notesListSection}>
                <Text style={styles.notesListHeader}>I dag</Text>
                {todayNotes.map(note => <NoteListItem key={note.id} {...note} />)}

                <Text style={styles.notesListHeader}>I går</Text>
                {yesterdayNotes.map(note => <NoteListItem key={note.id} {...note} />)}
                
                {/* Placeholder for Sykemelding if it's a special list item */}
                <View style={styles.sykemeldingItem}>
                    <Text style={styles.sykemeldingText}>Sykemelding</Text>
                </View>
            </ScrollView>

            <View style={styles.footerSection}>
                <SidebarButton title="Innstillinger" onPress={() => {}} style={styles.footerButton} textStyle={styles.footerButtonText} />
                <SidebarButton title="Hjelp" onPress={() => {}} style={styles.footerButton} textStyle={styles.footerButtonText} />
                <SidebarButton title="Logg ut" onPress={onSignOut} style={styles.footerButton} textStyle={styles.footerButtonText} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebarContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    logoSection: {
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 10,
    },
    logoText: {
        fontSize: 28,       // Increased size
        fontWeight: 'bold',
        color: '#1f2937',   // Darker color
    },
    userEmail: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    actionsSection: {
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    sidebarButton: {
        backgroundColor: '#e0e7ff', // Light indigo background
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 6,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sidebarButtonText: {
        color: '#3730a3', // Indigo text
        fontWeight: '500',
        fontSize: 15,
        marginLeft: 8, // If using icons
    },
    notesListSection: {
        flex: 1, // Takes available space
        paddingHorizontal: 10,
    },
    notesListHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280', // Medium gray
        marginTop: 15,
        marginBottom: 8,
        paddingHorizontal: 5,
    },
    noteItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginBottom: 5,
    },
    noteItemActive: {
        backgroundColor: '#dbeafe', // Light blue for active item
    },
    noteItemTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151', // Darker gray
    },
    noteItemTitleActive: {
        color: '#1e40af', // Darker blue for active title
    },
    noteItemTime: {
        fontSize: 12,
        color: '#9ca3af', // Lighter gray
    },
    noteItemTimeActive: {
        color: '#60a5fa', // Medium blue for active time
    },
    sykemeldingItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 10, // Give it some space
    },
    sykemeldingText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },
    footerSection: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    footerButton: {
        backgroundColor: 'transparent', // No background for footer buttons
        paddingVertical: 8,
    },
    footerButtonText: {
        color: '#4b5563', // Default gray text
        fontWeight: 'normal',
        fontSize: 14,
        marginLeft: 0, // Reset margin if icons are not used here
    }
});

export default Sidebar; 