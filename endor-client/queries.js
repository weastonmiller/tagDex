import { gql } from 'graphql-tag';

export const GetTags = gql`
  query GetTags {
    getTags {
      _id
      label
    }
  }
`;

export const GetPosts = gql`
  query GetPosts($_id: String) {
    getPosts(_id: $_id) {
      _id
      imageUrl
    }
  }
`;

export const GetPostDetails = gql`
  query GetPosts($_id: String) {
    getPosts(_id: $_id) {
      _id
      message
      imageUrl
      createdAt
      updatedAt
      tags {
        _id
        label
      }
    }
  }
`;

export const CreatePost = gql`
  mutation CreatePost($input: PostInput) {
    createPost(input: $input)
  }
`;
