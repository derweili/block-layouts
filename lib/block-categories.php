<?php

namespace Derweili\Content_Templates;


add_filter( 'block_categories', function( $categories, $post ) {
	return array_merge(
		$categories,
		[
			[
                'slug' => 'jsforwpadvblocks',
                'icon' => 'wordpress-alt',
				'title' => __( 'JS for WP - Advanced Blocks', 'jsforwpadvblocks' ),
			],
		]
	);
}, 10, 2 );