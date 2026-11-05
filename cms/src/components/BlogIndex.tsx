'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Post } from '../payload-types'
import { coverPhoto, departments, excerpt, monthAndYear } from '../lib/blog'

export function BlogCard({ post }: { post: Post }) {
  const photo = coverPhoto(post)
  return <Link className="blog-card" href={`/blog/${post.id}`} aria-label={`Read ${post.title}`}>
    <div className={`blog-card-photo ${!photo ? 'blog-card-placeholder' : ''}`}>
      {photo ? <img src={photo.sizes?.thumbnail?.url || photo.url!} alt={photo.alt} /> : <span aria-hidden="true">Nordlys<span>FROM IDEA TO RACETRACK</span></span>}
    </div>
    <div className="blog-card-body">
      <div className="blog-card-meta"><span>{post.department || 'Team'}</span><time dateTime={post.publishedAt}>{monthAndYear(post.publishedAt)}</time></div>
      <h2>{post.title}</h2><p>{excerpt(post)}</p>
      <span className="blog-card-read">Read article <span aria-hidden="true">↗</span></span>
    </div>
  </Link>
}

export function BlogIndex({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [year, setYear] = useState('all')
  const [pageSize, setPageSize] = useState(12)
  const years = [...new Set(posts.map((post) => String(new Date(post.publishedAt).getUTCFullYear())))].sort().reverse()
  const matching = useMemo(() => posts.filter((post) =>
    (department === 'all' || (post.department || 'Team') === department) &&
    (year === 'all' || String(new Date(post.publishedAt).getUTCFullYear()) === year) &&
    `${post.title} ${excerpt(post)} ${post.authorName || ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  ), [posts, search, department, year])
  const filtered = search !== '' || department !== 'all' || year !== 'all'
  return <>
    <section className="blog-filters" aria-label="Find an article">
      <div className="blog-search"><label htmlFor="blog-search">Search articles</label>
        <input id="blog-search" type="search" placeholder="Find a story…" value={search} onChange={(event) => { setSearch(event.target.value); setPageSize(12) }} /></div>
      <div><label htmlFor="blog-group">Group</label><select id="blog-group" value={department} onChange={(event) => { setDepartment(event.target.value); setPageSize(12) }}>
        <option value="all">All groups</option>{departments.map((group) => <option key={group}>{group}</option>)}
      </select></div>
      <div><label htmlFor="blog-year">Year</label><select id="blog-year" value={year} onChange={(event) => { setYear(event.target.value); setPageSize(12) }}>
        <option value="all">All years</option>{years.map((value) => <option key={value}>{value}</option>)}
      </select></div>
    </section>
    <div className="blog-results"><p role="status">{matching.length} {matching.length === 1 ? 'article' : 'articles'}</p>
      {filtered && <button type="button" onClick={() => { setSearch(''); setDepartment('all'); setYear('all'); setPageSize(12) }}>Clear filters</button>}</div>
    <div className="blog-grid">{matching.slice(0, pageSize).map((post) => <BlogCard key={post.id} post={post} />)}</div>
    {!matching.length && <div className="blog-empty"><h2>{posts.length ? 'No matching articles' : 'Our next chapter is on its way'}</h2>
      <p>{posts.length ? 'Try another search or clear the filters.' : 'Published updates will appear here.'}</p></div>}
    {matching.length > pageSize && <button className="blog-more" type="button" onClick={() => setPageSize(pageSize + 12)}>Show more articles</button>}
  </>
}
