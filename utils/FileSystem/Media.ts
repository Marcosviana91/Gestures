import * as FileSystem from 'expo-file-system';

const SITE = process.env.EXPO_PUBLIC_SITE_URL;

const mediaDir = FileSystem.documentDirectory + 'media/';

// Checks if media directory exists. If not, creates it
async function ensureDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(mediaDir);
    if (!dirInfo.exists) {
        console.log("Media directory doesn't exist, creating…");
        await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
    }
}

// Checks if media subdirectory exists. If not, creates it
async function ensureSubDirExists(subDir: string) {
    await ensureDirExists();
    const dirInfo = await FileSystem.getInfoAsync(mediaDir + subDir);
    if (!dirInfo.exists) {
        console.log(subDir + " directory doesn't exist, creating…");
        await FileSystem.makeDirectoryAsync(mediaDir + subDir, { intermediates: true });
    }
}

export async function checkGameMediaFiles(files: string[]) {
    var media_to_download_list: string[] = []
    await Promise.all(
        files.map(async file_name => {
            const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file_name.substring(1));
            if (!fileInfo.exists) {
                media_to_download_list.push(file_name);
            }
        })
    )
    return media_to_download_list
}

// Downloads all avatars specified as array of file names
async function getMultipleMediaFiles(files: string[]) {
    try {
        console.log('Downloading', files.length, ' game files…');
        await Promise.all(files.map(file_name => FileSystem.downloadAsync(
            SITE + file_name,
            FileSystem.documentDirectory + file_name.substring(1)
        )));
    } catch (e) {
        console.error("Couldn't download media files:", e);
    }
}

export async function getGameMediaFiles(files: string[]) {
    try {
        try {
            // TODO usar um FOR para cada subpasta
            await ensureSubDirExists('games');
            await ensureSubDirExists('game_boards');
            await ensureSubDirExists('cards');
            console.log('All sub directories are ok...');
        } catch (e) {
            throw e
        }
        await checkGameMediaFiles(files)
        await getMultipleMediaFiles(files).then(() => {
            console.log("Finish");
        })
    } catch (e) {

    }
    return true
}

// Returns Base64 string to use as image source.
export async function getMediaBase64(path_to_media_file: string) {
    const base64 = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+path_to_media_file, { encoding: 'base64' })
    return 'data:image/png;base64,' + base64
}

