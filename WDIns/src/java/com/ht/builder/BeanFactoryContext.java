package com.ht.builder;

import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class BeanFactoryContext {

	protected static Logger log = Logger.getLogger(BeanFactoryContext.class);
	private static final String SPRING_CONTEXT_FILE = "/spring.xml";

	private static ApplicationContext appContext = null;

	public BeanFactoryContext() {
		initSprintContext();
	}

	private static synchronized void initSprintContext() {
		try {
			appContext = new ClassPathXmlApplicationContext(SPRING_CONTEXT_FILE);
		} catch (final Exception e) {
			log.error(e.getMessage(), e);
		}
	}

	public static ApplicationContext getAppContext() {

		if (appContext == null) {
			initSprintContext();
		}

		return appContext;
	}
	
	public static void destroy() {
		appContext = null;
	}
}
