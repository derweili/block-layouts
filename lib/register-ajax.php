<?php
namespace Derweili\Content_Templates;

add_action( 'wp_ajax_copy_from_template', __NAMESPACE__ . '\register_ajax', 40 );
add_action( 'wp_ajax_nopriv_copy_from_template', __NAMESPACE__ . '\register_ajax', 40 );

function register_ajax() {
    // error_log('ajax');

    // $template = intval( $_POST['template'] );

    $currentPostId = intval( $_POST['post'] );
    $templateId = intval( $_POST['template'] );

    $post = get_post($templateId);
    setup_postdata($post);

    $templateContent = get_the_content();

    $my_post = array(
        'ID'           => $currentPostId,
        'post_content' => $templateContent,
    );
  
  // Update the post into the database
    $updated_post = wp_update_post( $my_post );

    if( is_wp_error( $updated_post ) ){
        echo json_encode(array(
            'success' => false,
            'error' => $updated_post->get_error_message()
        ));
    }else{
        echo json_encode(array(
            'success' => true,
            'template' => $templateContent
        ));
    }
    // var_dump($_POST);
    die();

}