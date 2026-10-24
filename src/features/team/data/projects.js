import profiles from './members.json';
import project2025 from './projects/2025.json';
import project2026 from './projects/2026.json';
import { buildProjects } from '../teamData.mjs';

export const projects = buildProjects(profiles, [project2025, project2026]);
