import Head from 'next/head';
import Content from '@shared/components/Content';
import Groups from '@features/team/Groups';
import JoinForm from '@features/join/JoinForm';
import Layout from '@shared/components/Layout';
import PageHeader from '@features/ui/PageHeader';
import PartHeader from '@shared/components/PartHeader';
import BlogEntry from '@shared/components/BlogEntry';
import React from 'react'
import { blogs } from '@shared/data/blog';

export default function Blog() {
	return (
	<>
		<Head>
			<title>Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
      		</Head>
      		<Layout>
		    <></>
      		    <PageHeader title="Blog" />
      		    <Content dark={true}>
			        {blogs.map(blog => {
			        	return <div style={{"margin-bottom": "3pc"}}>
						 <BlogEntry
                            			 text={blog.text}
                            			 image={blog.image} 
						 date={blog.date}/>
					       </div>
			        })}
      		    </Content>
      		</Layout>
	</>
	)
}
