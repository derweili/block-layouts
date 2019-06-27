<?php

namespace Derweili\Block_Layouts;

add_filter( 'plugin_row_meta', __NAMESPACE__ . '\plugin_row_meta', 10, 2 );

/**
 * Add additional Links to Plugin in Plugin List
 */
function plugin_row_meta( $links, $file ) {
	if ( strpos( $file, 'block-layouts' ) !== false ) {
        
        $url = admin_url( 'edit.php?post_type=block-layout' );

		$new_links = array(
            'manage' => '<a href="' . $url . '" target="">Manage Layouts</a>',
        );
		
		$links = array_merge( $links, $new_links );
	}
	
	return $links;
}