import { Role } from '../auth/role';

// ─── User & Resource Types Only adding the types which are necessary for permission

export interface User {
    id: number;
    role: Role;
}

export interface Issue {
    id: number;
    userID: number;
}

export interface Comment {
    id: number;
    userID: number;
}

// ─── Issue Permissions ──────────────────────────────────────────────────

export const canViewIssue = (user: User, issue: Issue): boolean => {
    // SUPERADMIN and MANAGER can view all issues
    if (user.role === Role.SUPERADMIN || user.role === Role.MANAGER) return true;
    // USER can only view their own
    return user.id === issue.userID;
};

export const canEditIssue = (user: User, issue: Issue): boolean => {
    // SUPERADMIN and MANAGER can edit all issues
    if (user.role === Role.SUPERADMIN || user.role === Role.MANAGER) return true;
    return user.id === issue.userID;
};

export const canDeleteIssue = (user: User, issue: Issue): boolean => {
    // Only SUPERADMIN or the creator can delete
    if (user.role === Role.SUPERADMIN) return true;
    return user.id === issue.userID;
};

export const canChangeIssueStatus = (user: User, issue: Issue): boolean => {
    return canEditIssue(user, issue);
};

// ─── Comment Permissions ─────────────────────────────────────────────────

export const canCreateComment = (user: User, issue: Issue): boolean => {
    // To comment, user must be able to view the issue
    return canViewIssue(user, issue);
};

export const canEditComment = (user: User, comment: Comment): boolean => {
    // SUPERADMIN and MANAGER can edit any comment
    if (user.role === Role.SUPERADMIN || user.role === Role.MANAGER) return true;
    return user.id === comment.userID;
};

export const canDeleteComment = (user: User, comment: Comment): boolean => {
    // SUPERADMIN and MANAGER can delete any comment
    if (user.role === Role.SUPERADMIN || user.role === Role.MANAGER) return true;
    return user.id === comment.userID;
};

// ─── Manager Request Permissions ────────────────────────────────────────



export const canViewManagerRequests = (user: User): boolean => {
    // Only SUPERADMIN can view all requests
    return user.role === Role.SUPERADMIN;
};

export const canReviewManagerRequest = (user: User): boolean => {
    // Only SUPERADMIN can review requests
    return user.role === Role.SUPERADMIN;
};