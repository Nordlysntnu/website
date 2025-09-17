import Head from 'next/head';
import Content from '../../../components/Content';
import Groups from '../../../components/Groups';
import JoinForm from '../../../components/JoinForm';
import Layout from '../../../components/Layout';
import PageHeader from '../../../components/PageHeader';
import PartHeader from '../../../components/PartHeader';
import BlogEntry from './BlogEntry';
import React from 'react'
import { blogs } from '../../../data/blog';

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
