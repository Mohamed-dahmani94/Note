export const mockSocialAnalysis = async (link) => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            // Mock random follower count
            const randomFollowers = Math.floor(Math.random() * 80000) + 1500;
            resolve({
                platform: link.includes('instagram') ? 'Instagram' : link.includes('tiktok') ? 'TikTok' : 'Facebook',
                followers: randomFollowers
            });
        }, 1500);
    });
};

export const mockPdfExtract = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                pageCount: 154,
                sampleText: "Ceci est un extrait simulé des 20 premières pages du manuscrit...",
                isValid: true
            });
        }, 2000);
    });
};
