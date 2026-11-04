type FlatAnnotation = {
  id: string;
  parentId: string | null;
  createdAt: Date;
  [key: string]: unknown;
};

export function buildAnnotationTree<T extends FlatAnnotation>(annotations: T[]) {
  const byId = new Map(annotations.map((a) => [a.id, { ...a, replies: [] as T[] }]));
  const roots: (T & { replies: T[] })[] = [];

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies.push(node as T & { replies: T[] });
    } else if (!node.parentId) {
      roots.push(node as T & { replies: T[] });
    }
  }

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return roots;
}
