<?php

namespace Derweili\Content_Templates;

add_filter( 'plugin_row_meta', __NAMESPACE__ . '\plugin_row_meta', 10, 2 );

/**
 * Add additional Links to Plugin in Plugin List
 */
function plugin_row_meta( $links, $file ) {
	if ( strpos( $file, 'content-templates' ) !== false ) {
        
        $url = admin_url( 'edit.php?post_type=content-template' );

		$new_links = array(
            'manage' => '<a href="' . $url . '" target="">Manage Templates</a>',
        );
		
		$links = array_merge( $links, $new_links );
	}
	
	return $links;
}