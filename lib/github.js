export async function getGithubData(username) {
    try {
      // 1. Fetch User Data & Repos (Parallel for speed)
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { cache: 'no-store' }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { cache: 'no-store' })
      ]);
  
      if (!userRes.ok || !reposRes.ok) {
        throw new Error("Failed to fetch GitHub data");
      }
  
      const userData = await userRes.json();
      const repos = await reposRes.json();
  
      // 2. Calculate Stats
      // Count languages used across all repos
      const languages = {};
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });
  
      // Sort languages by usage
      const topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4) // Top 4 only
        .map(([name, count]) => ({ name, count }));
  
      return {
        user: userData,
        repos: repos.slice(0, 6), // Just top 6 recent for dashboard
        totalRepos: userData.public_repos,
        followers: userData.followers,
        topLanguages,
      };
  
    } catch (error) {
      console.error("GitHub API Error:", error);
      return null;
    }
  }
  