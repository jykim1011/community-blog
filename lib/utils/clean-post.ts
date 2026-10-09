import type { StaticPost } from '../types';

// 제목 끝에 붙은 댓글 수 "(27)" / "[27]" — 루리웹 등은 목록 HTML 에서 제목과 댓글 수가 한 덩어리로 들어온다.
const TRAILING_COUNT = /\s*[([](\d{1,5})[)\]]\s*$/;

/**
 * 크롤링된 글의 제목을 정리한다.
 * - 연속 공백/줄바꿈을 하나로
 * - 제목 끝의 댓글 수 표기를 떼어 commentCount 로 옮김 (commentCount 가 비어 있을 때만)
 */
export function cleanPost<T extends Pick<StaticPost, 'title' | 'commentCount'>>(post: T): T {
  let title = post.title.replace(/\s+/g, ' ').trim();
  let commentCount = post.commentCount;

  const m = title.match(TRAILING_COUNT);
  if (m && !commentCount) {
    const stripped = title.slice(0, m.index).trim();
    if (stripped) {
      title = stripped;
      commentCount = Number(m[1]);
    }
  }

  if (title === post.title && commentCount === post.commentCount) return post;
  return { ...post, title, commentCount };
}
