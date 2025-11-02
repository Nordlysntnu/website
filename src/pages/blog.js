import Head from 'next/head';
import Content from '@shared/components/Content';
import Groups from '@features/team/Groups';
import JoinForm from '@features/join/JoinForm';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import PartHeader from '@shared/components/PartHeader';
import BlogEntry from '@shared/components/BlogEntry';
import React from 'react'
import { blogs } from '@shared/data/blog';

export default function Blog() {
	const pagetext = "Nordlys NTNU never goes on vacation — year round, our members work designing, developing, producing and testing our technology. And beyond the pure technical work, we also travel around Europe, host and attend events, and do many fun social activities together. Here on our blog, you can see a snapshot of these activities.";

	return (
	<>
		<Head>
			<title>Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
      		</Head>
      		<Layout>
			<></>
      		    <PageHeader title="Blog" />
					<Content dark={true}><p>{pagetext}</p></Content>
      		    <Content dark={true} nopad={true}>
			        {blogs.map(blog => {
			        	return <div style={{"width": "100%", "margin-bottom": "3pc"}}>
						 <BlogEntry
                            			 text={blog.text}
                            			 images={blog.images} 
						 date={blog.date}/>
					       </div>
			        })}
      		    </Content>
      		</Layout>
	</>
	)
}
