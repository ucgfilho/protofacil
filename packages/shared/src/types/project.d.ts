export type ProjectRole = 'owner' | 'editor' | 'viewer';
export interface Project {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ProjectCollaborator {
    id: string;
    projectId: string;
    userId: string;
    role: ProjectRole;
    createdAt: string;
}
export interface ProjectSummary {
    id: string;
    name: string;
    description: string | null;
    updatedAt: string;
}
export interface CreateProjectInput {
    name: string;
    description: string | null;
}
export interface RenameProjectInput {
    name: string;
}
