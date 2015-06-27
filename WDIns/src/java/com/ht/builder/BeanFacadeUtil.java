package com.ht.builder;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;

public class BeanFacadeUtil implements BeanFactoryAware {

	private static BeanFactory beanFactory = null;

	public static BeanFactory getBeanFactory() {
		return beanFactory;
	}

	private static BeanFacadeUtil beanFacade = null;

	@Override
	public void setBeanFactory(final BeanFactory factory) throws BeansException {
		beanFactory = factory;
	}

	public static Object getBean(final String beanName) {

		return beanFactory.getBean(beanName);

	}
	
	public static <T> T getBean(Class<T> clazz) {

		return beanFactory.getBean(clazz);

	}

	public static BeanFacadeUtil getInstance() {
		if (beanFacade == null) {
			beanFacade = (BeanFacadeUtil) beanFactory.getBean("beanFacade");
		}
		return beanFacade;
	}

}
