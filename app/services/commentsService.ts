import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

interface Comment {
    text: string;
    createdAT: string;
    updatedAT: string;
    userID: number;
    issueID: number;
    user?: {
        id: number;
        email: string;
        name: string;
        role: string
    }
}
interface CreateComment {
    text: string;
    issueID: number,
}
interface UpdateComment {
    text: string
}

export const getCommentsForIssue = async (issueId: string): Promise<Comment[]> => {
    const res = await axiosInstance.get<Comment[]>(ENDPOINTS.COMMENTS_BY_ISSUE(issueId));
    return res.data;
};

const createComment = async (comment: CreateComment): Promise<Comment> => {
    const res = await axiosInstance.post<Comment>(ENDPOINTS.COMMENTS, comment)
    return res.data;
}
export const updateComment = async (id: string, updatedComment: UpdateComment): Promise<Comment> => {
    const res = await axiosInstance.put<Comment>(ENDPOINTS.COMMENT_BY_ID(id), updatedComment);
    return res.data;
};

export const deleteComment = async (id: string): Promise<Comment> => {
    const res = await axiosInstance.delete<Comment>(ENDPOINTS.COMMENT_BY_ID(id));
    return res.data;
};




