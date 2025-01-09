import * as FileSystem from 'expo-file-system';

export async function readFile(file_path: string) {
    const file_content = await FileSystem.readAsStringAsync(file_path)
    return file_content
}